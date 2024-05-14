import {Menu} from 'antd'

export const BLOG_LANGUAGES = [
  {key: 'basic', label: 'basic'},
  {key: 'c', label: 'c'},
  {key: 'dart', label: 'dart'},
  {key: 'django', label: 'django'},
  {key: 'docker', label: 'docker'},
  {key: 'excelFormula', label: 'excelFormula'},
  {key: 'git', label: 'git'},
  {key: 'graphql', label: 'graphql'},
  {key: 'html', label: 'html'},
  {key: 'java', label: 'java'},
  {key: 'javascript', label: 'javascript'},
  {key: 'json', label: 'json'},
  {key: 'jsx', label: 'jsx'},
  {key: 'latex', label: 'latex'},
  {key: 'less', label: 'less'},
  {key: 'mongodb', label: 'mongodb'},
  {key: 'php', label: 'php'},
  {key: 'python', label: 'python'},
  {key: 'sass', label: 'sass'},
  {key: 'scss', label: 'scss'},
  {key: 'typescript', label: 'typescript'},
  {key: 'xquery', label: 'xquery'},
]

export const BLOG_LANGUAGES_LIST = (setLanguage) => (
  <Menu>
    {BLOG_LANGUAGES?.map((item) => (
      <Menu.Item key={item.key} onClick={() => setLanguage(item.label)}>
        {item.label}
      </Menu.Item>
    ))}
  </Menu>
)
