import {THEME_TYPE_DARK} from 'constants/ThemeSetting'
import useWindowsSize from 'hooks/useWindowsSize'
import React from 'react'
import {useSelector} from 'react-redux'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

// import data from "./data";

const TinyBarChart = ({data}) => {
  const {themeType} = useSelector((state) => state.settings)
  const darkTheme = themeType === THEME_TYPE_DARK
  const {innerWidth} = useWindowsSize()
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{top: 10, right: 0, left: -15, bottom: 0}}>
        <XAxis
          dataKey="name"
          stroke={darkTheme ? '#fff' : '#000'}
          interval={0}
          tick={innerWidth < 600 ? false : true}
        />
        <YAxis stroke={darkTheme ? '#fff' : '#000'} />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Legend />
        <Bar
          dataKey="time"
          fill={darkTheme ? '#13c2c2' : '#003366'}
          name="Hours Spent"
        >
          {data?.map((entry, index) => (
            <Cell fill={entry?.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default TinyBarChart
