import React, { Component } from 'react'
import { Button, Table, message, Popconfirm, Divider } from 'antd'
import { getStrategy, addStrategy, updateStrategy, deleteStrategy, getReceiver, addReceiver, updateReceiver, deleteReceiver } from '@apis/strategy'
import CreateEditStrategy from './strategy/create-edit-strategy'
import CreateEditReceiver from './strategy/create-edit-receiver'

export default class Strategy extends Component {
  state = {
    dataSource: [],
    expandData: {},
  }
  currentRow = null
  componentDidMount() {
    this.getList()
    this.expandLoading = false
  }
  getList() {
    getStrategy({}, (data) => {
      const obj = {}
      data.forEach((item) => {
        obj[item.id] = []
        if (item.id === 6) {
          obj[6].push({
            date: 6,
          })
        }
      })
      this.setState({
        dataSource: data.sort((a, b) => b.id - a.id).map(item => ({ child: [], ...item })),
        expandData: obj,
      })
    })
  }
  getReceiver = (id) => {
    this.expandLoading = true
    getReceiver({}, { id }, (res) => {
      const { expandData } = this.state
      expandData[id] = res || []
      this.setState({
        expandData,
      })
      this.expandLoading = false
    })
  }
  columns = [
    {
      title: '编号', align: 'center', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id - b.id,
    },
    { title: '名称', align: 'center', dataIndex: 'description', key: 'description' },
    { title: '描述', align: 'center', dataIndex: 'rule_labels', key: 'rule_labels' },
    {
      title: '操作',
      align: 'center',
      key: 'action',
      render: (text, record, index) => (
        <span>
          <a onClick={() => this.handleEdit(record)}>编辑</a>
          <Divider type="vertical" />
          <Popconfirm
            title="确定要删除吗?"
            onConfirm={() => this.handleDelete(record)}
            okText="Yes"
            cancelText="No"
          >
            <a href="#">删除</a>
          </Popconfirm>
        </span>
      ),
    },
  ]
  handleAdd = () => {
    this.createEditStrategy.updateValue()
  }
  handleEdit(record) {
    this.createEditStrategy.updateValue(record)
  }
  handleDelete(record) {
    // eslint-disable-next-line camelcase
    const { id, rule_labels } = record
    deleteStrategy({}, { id }, (res) => {
      // eslint-disable-next-line camelcase
      message.success(`删除${rule_labels}成功`)
      this.getList()
    })
  }
  handleEditReceiver(record) {
    this.createEditReceiver.updateValue({ mode: 'edit', ...record })
  }
  handleDeleteReceiver(record) {
    const { id } = record
    deleteReceiver({}, { id }, (res) => {
      message.success(`删除${id}成功`)
      this.getReceiver(this.currentRow)
    })
  }
  updateStrategy = values => new Promise((resolve) => {
    const { id, ...data } = values
    if (id) {
      updateStrategy(data, { id }, (res) => {
        resolve(true)
        this.getList()
      })
      return
    }
    addStrategy(data, (res) => {
      resolve(true)
      this.getList()
    })
  })
  updateReceiver = value => new Promise((resolve) => {
    const { id, mode, ...data } = value
    if (mode === 'edit') {
      updateReceiver(data, { id }, (res) => {
        resolve(true)
        this.getReceiver(this.currentRow)
      })
      return
    }
    addReceiver(data, { id }, (res) => {
      resolve(true)
      this.getReceiver(id)
    })
  })
  onRefStr(component) {
    this.createEditStrategy = component
  }
  onRefRec(component) {
    this.createEditReceiver = component
  }
  expandedRowRender(recordRow) {
    const { id } = recordRow
    const { expandData } = this.state
    const { expandLoading } = this
    if (!expandLoading) {
      this.getReceiver(id)
    }
    const addStrategyEvent = () => {
      this.createEditReceiver.updateValue({ id, mode: 'create' })
    }
    const columns = [
      {
        title: '报警时间段',
        align: 'center',
        dataIndex: 'date',
        render: (text, record) => (
          <span>{record.start_time}~{record.end_time}</span>
        ),
      },
      { title: '报警延迟', align: 'center', dataIndex: 'start' },
      { title: '报警周期', align: 'center', dataIndex: 'period' },
      { title: '报警用户', align: 'center', dataIndex: 'user' },
      { title: '值班组', align: 'center', dataIndex: 'duty_group' },
      { title: '报警用户组', align: 'center', dataIndex: 'group' },
      { title: 'Filter表达式', align: 'center', dataIndex: 'expression' },
      { title: '报警方式', align: 'center', dataIndex: 'method' },
      {
        title: () => (<div>操作<Divider type="vertical" /><a onClick={addStrategyEvent}>添加</a></div>),
        dataIndex: 'operation',
        align: 'center',
        key: 'operation',
        render: (text, record) => (
          <span>
            <a onClick={() => { this.currentRow = id; this.handleEditReceiver(record) }}>编辑</a>
            {/* <Divider type="vertical" /> */}
            <Popconfirm
              title="确定要删除吗?"
              onConfirm={() => { this.currentRow = id; this.handleDeleteReceiver(record) }}
              okText="Yes"
              cancelText="No"
            >
              <a href="#">删除</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return <Table columns={columns} dataSource={expandData[id]} pagination={false} rowKey="id" />
  }
  render() {
    const { dataSource } = this.state
    return (
      <div>
        <div id="top-section">
          <Button type="primary" onClick={this.handleAdd}>添加</Button>
        </div>
        <Table dataSource={dataSource} expandedRowRender={record => this.expandedRowRender(record)} columns={this.columns} rowKey="id" />
        <CreateEditStrategy OnRef={c => this.onRefStr(c)} onSubmit={this.updateStrategy} />
        <CreateEditReceiver OnRef={c => this.onRefRec(c)} onSubmit={this.updateReceiver} />
      </div>
    )
  }
}
