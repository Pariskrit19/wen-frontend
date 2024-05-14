import React, {useEffect, useState, useCallback} from 'react'
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query'
import '@ant-design/compatible/assets/index.css'
import {Card, Table, Input, Button, Form} from 'antd'
import CircularProgress from 'components/Elements/CircularProgress'
import {
  changeDate,
  debounce,
  getIsAdmin,
  handleResponse,
  MuiFormatDate,
} from 'helpers/utils'
import {
  addProject,
  deleteProject,
  getAllProjects,
  getProjectClients,
  getProjectStatus,
  getProjectTypes,
  updateProject,
} from 'services/projects'
import {POSITION_TYPES, PROJECT_COLUMNS} from 'constants/Projects'
import ProjectModal from 'components/Modules/ProjectModal'
import {useNavigate, useSearchParams} from 'react-router-dom'
import moment from 'moment'
import {notification} from 'helpers/notification'
import {getAllUsers, getUserPositionTypes} from 'services/users/userDetails'
import useWindowsSize from 'hooks/useWindowsSize'
import AccessWrapper from 'components/Modules/AccessWrapper'
import Select from 'components/Elements/Select'
import ProjectSelect from 'components/Elements/Select/ProjectSelect'
import {PAGE25, PLACE_HOLDER_CLASS} from 'constants/Common'
import {emptyText} from 'constants/EmptySearchAntd'
import {useSelector} from 'react-redux'
import {selectAuthUser} from 'appRedux/reducers/Auth'
import {socket} from 'pages/Main'
import {getProjectTags} from 'services/projects'
import EstimateHistoryModal from 'components/Modules/EstimateHistoryModal'

const Search = Input.Search
const FormItem = Form.Item

const formattedProjects = (projects) => {
  return projects?.map((project) => ({
    ...project,
    key: project._id,
    projectStatus: project.projectStatus?.name,
    projectTypes: project.projectTypes?.map((x) => (
      <p style={{margin: 0}}>{x?.name}</p>
    )),
    startDate: project?.startDate ? changeDate(project?.startDate) : '',
    endDate: project?.endDate ? changeDate(project?.endDate) : '',
  }))
}

function ProjectsPage() {
  // init hooks
  let [searchParams, setSearchParams] = useSearchParams()
  const [sort, setSort] = useState({})
  const {innerWidth} = useWindowsSize()
  const [clearModal, setClearModal] = useState(false)
  const [form] = Form.useForm()
  const [projectId, setProjectId] = useState(
    searchParams?.get('projectId') || undefined
  )
  const [page, setPage] = useState({page: 1, limit: 25})
  const [projectStatus, setProjectStatus] = useState(
    searchParams.get('statusId') || undefined
  )
  const [projectTags, setProjectTags] = useState(
    searchParams?.get('tagId') || undefined
  )
  const [projectType, setProjectType] = useState(
    searchParams?.get('typeId') || undefined
  )
  const [projectClient, setprojectClient] = useState(
    searchParams?.get('clientId') || undefined
  )
  const [developer, setDeveloper] = useState(
    searchParams?.get('developerId') || undefined
  )
  const [designer, setDesigner] = useState(
    searchParams?.get('designerId') || undefined
  )
  const [projectArray, setProjectArray] = useState(
    searchParams?.get('projectId')
      ? [
          {
            _id: searchParams?.get('projectId'),
            name: searchParams?.get('projectName'),
          },
        ]
      : []
  )
  const [qa, setQa] = useState(searchParams?.get('qaId') || undefined)
  const [openUserDetailModal, setOpenUserDetailModal] = useState(false)
  const [userRecord, setUserRecord] = useState({})
  const [readOnly, setReadOnly] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [positionTypeData, setPositionTypeData] = useState({})
  const queryClient = useQueryClient()
  const [searchProject, setSearchProject] = useState(
    searchParams?.get('projectName') || undefined
  )

  const navigate = useNavigate()

  const {
    role: {key, permission},
  } = useSelector(selectAuthUser)

  const {data: projectTypesData} = useQuery(['projectTypes'], getProjectTypes)
  const {data: projectStatusData} = useQuery(
    ['projectStatus'],
    getProjectStatus
  )
  const {data: projectClientsData} = useQuery(
    ['projectClients'],
    getProjectClients
  )
  const {data: positionTypes} = useQuery(
    ['userPositionTypes'],
    getUserPositionTypes
  )
  const {data: developers} = useQuery(['developers', positionTypeData], () =>
    getAllUsers({positionType: positionTypeData?.developer, sort: 'name'})
  )
  const {data: designers} = useQuery(['designers', positionTypeData], () =>
    getAllUsers({positionType: positionTypeData?.designer, sort: 'name'})
  )
  const {data: QAs} = useQuery(['QA', positionTypeData], () =>
    getAllUsers({positionType: positionTypeData?.qa, sort: 'name'})
  )
  const {data: devops} = useQuery(['DevOps', positionTypeData], () =>
    getAllUsers({positionType: positionTypeData?.devops, sort: 'name'})
  )
  const allUsers = useQuery(['allUsers'], getAllUsers)
  const {data: projectTagsData} = useQuery(['tags'], getProjectTags)

  const {data, isLoading, isError, isFetching} = useQuery(
    [
      'projects',
      page,
      sort,
      projectType,
      projectStatus,
      projectTags,
      projectClient,
      developer,
      designer,
      qa,
      projectId,
      searchProject,
    ],
    () =>
      getAllProjects({
        ...page,
        project: searchProject,
        projectType,
        projectStatus,
        projectTags,
        projectClient,
        developer,
        designer,
        qa,
        projectId,
        sort:
          sort.order === undefined || sort.column === undefined
            ? ''
            : sort.order === 'ascend'
            ? sort.field
            : `-${sort.field}`,
      }),
    {keepPreviousData: true}
  )

  const addProjectMutation = useMutation((project) => addProject(project), {
    onSuccess: (response) =>
      handleResponse(
        response,
        'Project Added Successfully',
        'Project addition failed',
        [
          () => queryClient.invalidateQueries(['projects']),
          () => handleCloseModal(),
          () => setClearModal(true),
          () => {
            socket.emit('CUD')
          },
        ]
      ),
    onError: (error) => {
      notification({message: 'Project addition failed!', type: 'error'})
    },
  })
  const updateProjectMutation = useMutation(
    (project) => updateProject(project?.id, project?.details),
    {
      onSuccess: (response) =>
        handleResponse(
          response,
          'Project Updated Successfully',
          'Project update failed',
          [
            () => queryClient.invalidateQueries(['projects']),
            () => handleCloseModal(),
            () => setClearModal(true),
            () => {
              socket.emit('CUD')
            },
          ]
        ),
      onError: (error) => {
        notification({message: 'Project update failed', type: 'error'})
      },
    }
  )

  const deleteProjectMutation = useMutation(
    (projectId) => deleteProject(projectId),
    {
      onSuccess: (response) =>
        handleResponse(
          response,
          'Project removed Successfully',
          'Project deletion failed',
          [
            () => queryClient.invalidateQueries(['projects']),
            () => {
              socket.emit('CUD')
            },
          ]
        ),
      onError: (error) => {
        notification({message: 'Project deletion failed', type: 'error'})
      },
    }
  )

  useEffect(() => {
    const types = positionTypes?.data?.data?.data

    if (types?.length > 0) {
      setPositionTypeData({
        developer: types?.find(
          (type) => type.name.toLowerCase() === POSITION_TYPES?.developer
        )?._id,
        designer: types?.find(
          (type) => type.name.toLowerCase() === POSITION_TYPES?.designer
        )?._id,
        qa: types?.find(
          (type) => type.name.toLowerCase() === POSITION_TYPES?.qa
        )?._id,
        devops: types?.find(
          (type) => type.name.toLowerCase() === POSITION_TYPES?.devops
        )?._id,
      })
    }
  }, [positionTypes])

  useEffect(() => {
    if (isError) {
      notification({message: 'Could not load Projects!', type: 'error'})
    }
  }, [isError])

  const handleUserDetailSubmit = (project) => {
    try {
      const updatedProject = {
        ...project,
        estimatedHours: project?.estimatedHours
          ? +project?.estimatedHours
          : undefined,
        startDate: project?.startDate
          ? MuiFormatDate(new Date(moment.utc(project?.startDate)?.format()))
          : undefined,
        endDate: project?.endDate
          ? MuiFormatDate(new Date(moment.utc(project?.endDate)?.format()))
          : '',
      }
      if (isEditMode)
        updateProjectMutation.mutate({
          id: userRecord.id,
          details: updatedProject,
        })
      else addProjectMutation.mutate(updatedProject)
    } catch (error) {
      notification({message: 'Project Addition Failed', type: 'error'})
    }
  }

  const handleOpenEditModal = (projectToUpdate, mode) => {
    const originalProject = data?.data?.data?.data?.find(
      (project) => project?.id === projectToUpdate?.id
    )
    setOpenUserDetailModal((prev) => !prev)
    setUserRecord({
      id: projectToUpdate.id,
      project: {
        ...projectToUpdate,
        projectStatus: originalProject?.projectStatus,
        projectTypes: originalProject?.projectTypes,
        startDate: originalProject.startDate ?? null,
        endDate: originalProject?.endDate ?? null,
      },
    })
    setReadOnly(mode)
    setIsEditMode(true)
  }

  const handleOpenAddModal = () => {
    setOpenUserDetailModal((prev) => !prev)
    setReadOnly(false)
  }

  const handleCloseModal = () => {
    setOpenUserDetailModal((prev) => !prev)
    setUserRecord({})
    setIsEditMode(false)
  }

  const handleTableChange = (pagination, filters, sorter) => {
    setSort(sorter)
  }

  const handlePageChange = (pageNumber) => {
    setPage((prev) => ({...prev, page: pageNumber}))
  }

  const onShowSizeChange = (_, pageSize) => {
    setPage((prev) => ({...page, limit: pageSize}))
  }

  const settingQuery = (values) => {
    let queryString = {}
    if (!values.toString()) {
      return setSearchParams({})
    }
    values.forEach((value, key) => {
      queryString = {
        ...queryString,
        [key]: value,
      }
    })
    setSearchParams(queryString)
  }

  const handleProjectTypeChange = (typeId) => {
    setPage(PAGE25)
    if (!typeId) {
      searchParams.delete('typeId')
      settingQuery(searchParams)
    } else {
      searchParams.set('typeId', typeId)
      settingQuery(searchParams)
    }
    setProjectType(typeId)
  }

  const handleProjectStatusChange = (statusId) => {
    setPage(PAGE25)
    if (!statusId) {
      searchParams.delete('statusId')
      settingQuery(searchParams)
    } else {
      searchParams.set('statusId', statusId)
      settingQuery(searchParams)
    }
    setProjectStatus(statusId)
  }

  const handleClientChange = (clientId) => {
    setPage(PAGE25)
    if (!clientId) {
      searchParams.delete('clientId')
      settingQuery(searchParams)
    } else {
      searchParams.set('clientId', clientId)
      settingQuery(searchParams)
    }
    setprojectClient(clientId)
  }

  const handleProjectTagsChange = (tagId) => {
    if (!tagId) {
      searchParams.delete('tagId')
      settingQuery(searchParams)
    } else {
      searchParams.set('tagId', tagId)
      settingQuery(searchParams)
    }
    setPage(PAGE25)
    setProjectTags(tagId)
  }
  const handleDeveloperChange = (developerId) => {
    if (!developerId) {
      searchParams.delete('developerId')
      settingQuery(searchParams)
    } else {
      searchParams.set('developerId', developerId)
      settingQuery(searchParams)
    }
    setPage(PAGE25)
    setDeveloper(developerId)
  }
  const handleDesignerChange = (designerId) => {
    if (!designerId) {
      searchParams.delete('designerId')
      settingQuery(searchParams)
    } else {
      searchParams.set('designerId', designerId)
      settingQuery(searchParams)
    }
    setPage(PAGE25)
    setDesigner(designerId)
  }
  const handleQaChange = (qaId) => {
    if (!qaId) {
      searchParams.delete('qaId')
      settingQuery(searchParams)
    } else {
      searchParams.set('qaId', qaId)
      settingQuery(searchParams)
    }
    setPage(PAGE25)
    setQa(qaId)
  }

  const handleProjectNameChange = (projectName, isSelect) => {
    setPage(PAGE25)
    if (!projectName) {
      searchParams.delete('projectId')
      searchParams.delete('projectName')
      setProjectId(undefined)
      setSearchProject('')
    } else {
      if (isSelect) {
        const selectedName = projectArray?.find(
          (project) => project?._id === projectName
        )?.name
        setProjectId(projectName)
        setSearchProject('')
        searchParams.set('projectName', selectedName)
        searchParams.set('projectId', projectName)
      } else {
        searchParams.set('projectName', projectName)
        searchParams.delete('projectId')
        setProjectId('')
        setSearchProject(projectName)
      }
    }
    settingQuery(searchParams)
  }

  const handleResetFilter = () => {
    setProjectId(undefined)
    setProjectTags(undefined)
    setProjectType(undefined)
    setProjectStatus(undefined)
    setprojectClient(undefined)
    setDeveloper(undefined)
    setDesigner(undefined)
    setQa(undefined)
    setSearchParams({})
  }

  const handleSearch = async (projectName) => {
    if (!projectName) {
      return setProjectArray([])
    } else {
      const projects = await getAllProjects({
        project: projectName,
        sort: 'name',
      })
      setProjectArray(projects?.data?.data?.data)
    }
  }

  const optimizedFn = useCallback(debounce(handleSearch, 300), [])

  const confirmDeleteProject = (project) => {
    deleteProjectMutation.mutate(project._id)
  }

  const navigateToProjectLogs = (projectSlug) => {
    navigate(`${projectSlug}`)
  }

  if (isLoading) {
    return <CircularProgress />
  }

  return (
    <div>
      <ProjectModal
        toggle={openUserDetailModal}
        onClose={handleCloseModal}
        onSubmit={handleUserDetailSubmit}
        loading={
          addProjectMutation?.isLoading || updateProjectMutation?.isLoading
        }
        types={projectTypesData}
        statuses={projectStatusData}
        client={projectClientsData}
        developers={developers}
        designers={designers}
        tags={projectTagsData}
        qas={QAs}
        devops={devops}
        initialValues={userRecord?.project}
        readOnly={readOnly}
        isEditMode={isEditMode}
        clearModal={clearModal}
        setClearModal={setClearModal}
      />

      <Card title="Projects">
        <div className="components-table-demo-control-bar">
          <div className="gx-d-flex gx-flex-row">
            {' '}
            <FormItem className="search-project-item">
              <ProjectSelect
                showSearchIcon={true}
                value={projectId}
                onChange={handleProjectNameChange}
                handleSearch={optimizedFn}
                placeholder="Search Project"
                options={(projectArray || [])?.map((project) => ({
                  id: project._id,
                  value: project.name,
                }))}
                inputSelect
                isProjectSearch
                autoFocus
                searchProjectValue={searchProject}
              />
            </FormItem>
            <AccessWrapper role={permission?.Projects?.createProjects}>
              <div
                style={{
                  marginBottom: '1rem',
                  marginLeft: innerWidth >= 720 ? '1rem' : 0,
                }}
              >
                <Button
                  className="gx-btn gx-btn-primary gx-text-white "
                  onClick={handleOpenAddModal}
                  disabled={getIsAdmin()}
                >
                  Add New Project
                </Button>
              </div>
            </AccessWrapper>
          </div>
          <Form layout="inline" className="gx-d-flex gx-flex-row" form={form}>
            <FormItem className="direct-form-search">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Select Project Type"
                onChange={handleProjectTypeChange}
                value={projectType}
                options={projectTypesData?.data?.data?.data?.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>
            <FormItem className="direct-form-search">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Select Project Status"
                onChange={handleProjectStatusChange}
                value={projectStatus}
                options={projectStatusData?.data?.data?.data?.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>
            <FormItem className="direct-form-search">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Select Project Tag"
                onChange={handleProjectTagsChange}
                value={projectTags}
                options={projectTagsData?.data?.data?.data?.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>
            <FormItem className="direct-form-search">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Select Client"
                onChange={handleClientChange}
                value={projectClient}
                options={projectClientsData?.data?.data?.data?.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>
            <FormItem className="direct-form-search">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Select Developer"
                onChange={handleDeveloperChange}
                value={developer}
                options={developers?.data?.data?.data?.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>
            <FormItem className="direct-form-search">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Select Designer"
                onChange={handleDesignerChange}
                value={designer}
                options={designers?.data?.data?.data?.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>
            <FormItem className="direct-form-search">
              <Select
                placeholderClass={PLACE_HOLDER_CLASS}
                placeholder="Select QA"
                onChange={handleQaChange}
                value={qa}
                options={QAs?.data?.data?.data?.map((x) => ({
                  id: x?._id,
                  value: x?.name,
                }))}
              />
            </FormItem>
            <FormItem>
              <Button
                className="gx-btn gx-btn-primary gx-text-white gx-mt-auto"
                onClick={handleResetFilter}
              >
                Reset
              </Button>
            </FormItem>
          </Form>
        </div>
        <Table
          locale={{emptyText}}
          className="gx-table-responsive"
          columns={PROJECT_COLUMNS(
            sort,
            handleOpenEditModal,
            confirmDeleteProject,
            navigateToProjectLogs,
            permission
          )}
          dataSource={formattedProjects(data?.data?.data?.data)}
          onChange={handleTableChange}
          pagination={{
            current: page.page,
            pageSize: page.limit,
            pageSizeOptions: ['25', '50', '100'],
            showSizeChanger: true,
            total: data?.data?.data?.count || 1,
            onShowSizeChange,
            hideOnSinglePage: data?.data?.data?.count ? false : true,
            onChange: handlePageChange,
          }}
          loading={isLoading || isFetching || deleteProjectMutation?.isLoading}
        />
      </Card>
    </div>
  )
}

export default ProjectsPage
