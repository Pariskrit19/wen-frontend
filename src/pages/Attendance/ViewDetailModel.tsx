import React from 'react'
import {Button, Modal} from 'antd'
import styles from './styles.module.css'

function ViewDetailModel({
  toogle,
  handleCancel,
  attendanceToview,
  title,
}: {
  toogle: boolean
  handleCancel: any
  attendanceToview: any
  title: string
}) {
  const {
    attendanceDate,
    attendanceDay,
    punchInTime,
    punchOutTime,
    officeHour,
    punchInNote,
    punchOutNote,
  } = attendanceToview
  return (
    <Modal
      width={900}
      title={title}
      visible={toogle}
      onCancel={handleCancel}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Close
        </Button>,
      ]}
    >
      <div className={styles.model_container}>
        <div className={styles.rowDetail}>
          <div className={styles.item}>
            <div className={styles.itemHeading}>Date</div>
            <div className={styles.itemValue}>{attendanceDate}</div>
          </div>
          <div className={`${styles.item} day-attendance`}>
            <div className={styles.itemHeading}>Day</div>
            <div className={styles.itemValue}>{attendanceDay}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.itemHeading}>Punch-in Time</div>
            <div className={styles.itemValue}>{punchInTime}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.itemHeading}>Punch-out Time</div>
            <div className={styles.itemValue}>{punchOutTime}</div>
          </div>
          <div className={styles.item}>
            <div className={styles.itemHeading}>Office Hour</div>
            <div className={styles.itemValue}>{officeHour}</div>
          </div>
        </div>
        <div className={styles.punch_in_note}>
          <div className={styles.itemHeading}>Punch-in Note</div>
          <div className={styles.note}>{punchInNote}</div>
        </div>
        <div className={styles.gap}></div>
        <div className={styles.punch_in_note}>
          <div className={styles.itemHeading}>Punch-out Note</div>
          <div className={styles.note}>{punchOutNote}</div>
        </div>
      </div>
    </Modal>
  )
}

export default ViewDetailModel
