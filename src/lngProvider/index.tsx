import enLang from './entries/en-US'
import {addLocaleData} from 'react-intl'

const AppLocale: {[key: string]: any} = {
  en: enLang,
}
addLocaleData(AppLocale.en.data)

export default AppLocale
