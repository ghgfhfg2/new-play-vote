import { Button, Form, Input } from 'antd'
import React from 'react'

function JoinModal({onFinish}) {
  return (
    <Form onFinish={onFinish}>
      <Form.Item
        name="email"
        label="이메일"
        rules={[
          {                
            required: true,type: 'email',
            message: '이메일 형식에 맞지 않습니다.'
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="nick"
        label="닉네임"
        rules={[
          {                
            required: true,
            message: '닉네임을 입력해 주세요.'
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="비밀번호"
        name="password"
        rules={[{ pattern: new RegExp(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,16}$/g), required: true, message: '문자,숫자를 포함한 8~16자 이어야 합니다.' }]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        label="비밀번호 확인"
        name="passwordConfirm"
        rules={[{ required: true, message: '비밀번호 확인을 입력해 주세요.' }]}
      >
        <Input.Password />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form>
  )
}

export default JoinModal