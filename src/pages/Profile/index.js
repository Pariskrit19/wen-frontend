import React, {useState} from 'react'
import {Col, notification, Row} from 'antd'
import About from 'components/Modules/profile/About/index'
import Contact from '../../components/Modules/profile/Contact/index'
import Auxiliary from 'util/Auxiliary'
import ProfileHeader from 'components/Modules/profile/ProfileHeader'
import UserProfileModal from 'components/Modules/profile/UserProfileModal'
import {useMutation} from '@tanstack/react-query'
import {updateProfile} from 'services/users/userDetails'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import {storage} from 'firebase'
import moment from 'moment'
import {handleResponse} from 'helpers/utils'
import {useDispatch} from 'react-redux'
import {getUserProfile} from 'appRedux/actions'
import {LOCALSTORAGE_USER} from 'constants/Settings'
import {connect} from 'react-redux'

export const aboutList = [
  {
    id: 1,
    title: 'Gender',
    icon: 'user-o',
    name: 'gender',
  },
  {
    id: 2,
    title: 'Marital Status',
    icon: 'home',
    name: 'maritalStatus',
  },
  {
    id: 3,
    title: 'Date Of Birth',
    icon: 'birthday',
    name: 'dob',
  },
  {
    id: 4,
    title: 'Joined Date',
    icon: 'signup',
    name: 'joinDate',
  },
  {
    id: 5,
    title: 'Username',
    icon: 'avatar',
    name: 'username',
  },
]

function Profile(props) {
  const dispatch = useDispatch()
  const [openModal, setOpenModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const mutation = useMutation(updateProfile, {
    onSuccess: (response) => {
      handleResponse(
        response,
        'Update profile successfully',
        'Could not update profile',
        [
          () =>
            dispatch(
              getUserProfile({
                user: response?.data?.data?.user,
              })
            ),
          () => setOpenModal(false),
          () =>
            localStorage.setItem(
              LOCALSTORAGE_USER,
              JSON.stringify(response.data.data.user?._id)
            ),
          () => setIsLoading(false),
        ]
      )
    },

    onError: () => {
      notification({
        message: 'Could not update profile!',
        type: 'error',
      })
      setIsLoading(false)
    },
  })

  const aboutData = aboutList.map((about) => ({
    ...about,
    desc:
      about?.name === 'dob' || about?.name === 'joinDate'
        ? moment(props?.user?.[about?.name]).format('YYYY-MM-DD')
        : props?.user?.[about?.name],
  }))

  const handleProfileUpdate = async (user, removedFile) => {
    setIsLoading(true)
    let updatedUser = {
      ...user,
      dob: moment.utc(user?.dob._d).endOf('day').format().split('T')[0],
      joinDate: moment.utc(user?.joinDate?._d).format(),
      primaryPhone: +user?.primaryPhone,
      secondaryPhone: +user?.secondaryPhone || null,
      photoURL: user?.photoURL?.url,
    }
    if (removedFile) {
      const imageRef = ref(storage, removedFile)
      await deleteObject(imageRef)
      updatedUser = {...updatedUser, photoURL: null}
    }

    if (user?.photoURL?.originFileObj) {
      const storageRef = ref(storage, `profile/${user?.photoURL?.name}`)
      const uploadTask = uploadBytesResumable(
        storageRef,
        user?.photoURL?.originFileObj
      )

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // const pg = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          // setProgress(() => pg);
        },
        (error) => {
          // Handle unsuccessful uploads
          setIsLoading(false)
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            updatedUser = {
              ...updatedUser,
              photoURL: downloadURL,
            }
            mutation.mutate(updatedUser)
          })
        }
      )
    } else {
      mutation.mutate(updatedUser)
    }
  }

  return (
    <>
      <UserProfileModal
        toggle={openModal}
        onToggle={setOpenModal}
        user={props?.user}
        onSubmit={handleProfileUpdate}
        isLoading={isLoading}
      />

      <Auxiliary>
        <ProfileHeader
          user={{
            name: props?.user?.name,
            position: props?.user?.position?.name,
            photoURL: props?.user?.photoURL,
          }}
          onMoreDetailsClick={setOpenModal}
        />
        <div className="gx-profile-content">
          <Row>
            <Col xs={24} sm={24} md={14}>
              <About data={aboutData} />
            </Col>
            <Col xs={24} sm={24} md={10}>
              <Contact user={props} />
            </Col>
          </Row>
        </div>
      </Auxiliary>
    </>
  )
}

const mapStateToProps = ({auth}) => {
  const user = auth?.authUser
  return user
}

export default connect(mapStateToProps, null)(Profile)
