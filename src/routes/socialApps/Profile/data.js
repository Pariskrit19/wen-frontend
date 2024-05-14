import React from 'react'
import {Avatar} from 'antd'

const userImageList = [
  {
    id: 1,
    image: 'https://via.placeholder.com/150x150',
  },
  {
    id: 2,
    image: 'https://via.placeholder.com/150x150',
  },
  {
    id: 3,
    image: 'https://via.placeholder.com/150x150',
  },
  {
    id: 4,
    image: 'https://via.placeholder.com/150x150',
    name: 'Mila Alba',
    rating: '5.0',
    deals: '27 Deals',
  },
]

export const aboutList = [
  {
    id: 1,
    title: 'Email',
    icon: 'email',
    userList: '',
    desc: ['G-axon Tech Pvt. Ltd.'],
  },
  {
    id: 2,
    title: 'Birthday',
    icon: 'birthday-new',
    userList: '',
    desc: ['Oct 25, 1984'],
  },
  {
    id: 3,
    title: 'Went to',
    icon: 'graduation',
    userList: '',
    desc: ['Oxford University'],
  },
  {
    id: 4,
    title: 'Lives in London',
    icon: 'home',
    userList: '',
    desc: ['From Switzerland'],
  },
  {
    id: 5,
    title: '4 Family Members',
    icon: 'family',
    userList: [
      <ul className="gx-list-inline gx-mb-0" key={1}>
        {userImageList.map((user, index) => (
          <li className="gx-mb-2" key={index}>
            <Avatar className="gx-size-30" src={user.image} />
          </li>
        ))}
      </ul>,
    ],
    desc: '',
  },
]

export const eventList = [
  {
    id: 1,
    image: 'https://via.placeholder.com/575x480',
    title: 'Sundance Film Festival.',
    address: 'Downsview Park, Toronto, Ontario',
    date: 'Feb 23, 2019',
  },
  {
    id: 2,
    image: 'https://via.placeholder.com/575x480',
    title: 'Underwater Musical Festival.',
    address: 'Street Sacramento, Toronto, Ontario',
    date: 'Feb 24, 2019',
  },
  {
    id: 3,
    image: 'https://via.placeholder.com/575x480',
    title: 'Village Feast Fac',
    address: 'Union Street Eureka',
    date: 'Oct 25, 2019',
  },
]

export const contactList = (user) => [
  {
    id: 1,
    title: 'Email',
    icon: 'email',
    value: [<span className="gx-link">{user?.user?.email}</span>],
  },
  {
    id: 2,
    title: 'Primary Phone',
    icon: 'phone',
    value: user?.user?.primaryPhone,
  },
  {
    id: 3,
    title: 'Secondary Phone',
    icon: 'phone',
    value: user?.user?.secondaryPhone,
  },
]

export const friendList = [
  {
    id: 1,
    image: 'https://via.placeholder.com/150x150',
    name: 'Chelsea Johns',
    status: 'online',
  },
  {
    id: 2,
    image: 'https://via.placeholder.com/150x150',
    name: 'Ken Ramirez',
    status: 'offline',
  },
  {
    id: 3,
    image: 'https://via.placeholder.com/150x150',
    name: 'Chelsea Johns',
    status: 'away',
  },
  {
    id: 4,
    image: 'https://via.placeholder.com/150x150',
    name: 'Ken Ramirez',
    status: 'away',
  },
]
