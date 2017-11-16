import * as React from 'react'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {
  addUser,
  addRole,
  editUser,
  editRole,
  deleteUser,
  deleteRole,
  loadUsersAsync,
  loadRolesAsync,
  createUserAsync,
  createRoleAsync,
  deleteUserAsync,
  deleteRoleAsync,
  loadPermissionsAsync,
  updateRoleUsersAsync,
  updateUserRolesAsync,
  updateUserPasswordAsync,
  updateRolePermissionsAsync,
  updateUserPermissionsAsync,
  filterUsers as filterUsersAction,
  filterRoles as filterRolesAction,
} from 'admin/actions'

import AdminTabs from 'admin/components/AdminTabs'
import SourceIndicator from 'shared/components/SourceIndicator'
import FancyScrollbar from 'shared/components/FancyScrollbar'

import {publishAutoDismissingNotification} from 'shared/dispatchers'
import {Source} from 'src/types'
import {
  InfluxDBUser as User,
  InfluxDBRole as Role,
  InfluxDBPermission as Permission,
} from 'src/types/influxdbAdmin'

const isValidUser = (user: User): boolean => {
  const minLen = 3
  return user.name.length >= minLen && user.password.length >= minLen
}

const isValidRole = (role: Role): boolean => {
  const minLen = 3
  return role.name.length >= minLen
}

export interface AdminPageProps {
  source: Source
  users: User[]
  roles: Role[]
  permissions: Permission[]
  editUser: (user: User, updates: {}) => void
  editRole: (role: Role, updates: {}) => void
  loadUsers: typeof loadUsersAsync
  loadRoles: typeof loadRolesAsync
  loadPermissions: typeof loadPermissionsAsync
  addUser: typeof addUser
  addRole: typeof addRole
  removeUser: typeof deleteUserAsync
  removeRole: typeof deleteRoleAsync
  createUser: typeof createUserAsync
  createRole: typeof createRoleAsync
  deleteRole: typeof deleteRole
  deleteUser: typeof deleteUser
  filterRoles: typeof filterRolesAction
  filterUsers: typeof filterUsersAction
  updateRoleUsers: typeof updateRoleUsersAsync
  updateRolePermissions: typeof updateRolePermissionsAsync
  updateUserPermissions: typeof updateUserPermissionsAsync
  updateUserRoles: typeof updateUserRolesAsync
  updateUserPassword: typeof updateUserPasswordAsync
  notify: typeof publishAutoDismissingNotification
}

class AdminPage extends React.Component<AdminPageProps, {}> {
  public componentDidMount() {
    const {source, loadUsers, loadRoles, loadPermissions} = this.props

    loadUsers(source.links.users)
    loadPermissions(source.links.permissions)
    if (source.links.roles) {
      loadRoles(source.links.roles)
    }
  }

  public handleClickCreate = type => () => {
    if (type === 'users') {
      this.props.addUser()
    } else if (type === 'roles') {
      this.props.addRole()
    }
  }

  public handleEditUser = (user, updates) => {
    this.props.editUser(user, updates)
  }

  public handleEditRole = (role, updates) => {
    this.props.editRole(role, updates)
  }

  public handleSaveUser = user => {
    const {notify} = this.props
    if (!isValidUser(user)) {
      notify('error', 'Username and/or password too short')
      return
    }
    if (user.isNew) {
      this.props.createUser(this.props.source.links.users, user)
      // TODO update user
    }
  }

  public handleSaveRole = role => {
    const {notify} = this.props
    if (!isValidRole(role)) {
      notify('error', 'Role name too short')
      return
    }
    if (role.isNew) {
      this.props.createRole(this.props.source.links.roles, role)
    } else {
      // TODO update role
    }
  }

  public handleCancelEditUser = user => {
    this.props.removeUser(user)
  }

  public handleCancelEditRole = role => {
    this.props.removeRole(role)
  }

  public handleDeleteRole = role => {
    this.props.deleteRole(role)
  }

  public handleDeleteUser = user => {
    this.props.deleteUser(user)
  }

  public handleUpdateRoleUsers = (role, users) => {
    this.props.updateRoleUsers(role, users)
  }

  public handleUpdateRolePermissions = (role, permissions) => {
    this.props.updateRolePermissions(role, permissions)
  }

  public handleUpdateUserPermissions = (user, permissions) => {
    this.props.updateUserPermissions(user, permissions)
  }

  public handleUpdateUserRoles = (user, roles) => {
    this.props.updateUserRoles(user, roles)
  }

  public handleUpdateUserPassword = (user, password) => {
    this.props.updateUserPassword(user, password)
  }

  public render() {
    const {
      users,
      roles,
      source,
      permissions,
      filterUsers,
      filterRoles,
    } = this.props
    const hasRoles = !!source.links.roles
    const globalPermissions = permissions.find(p => p.scope === 'all')
    const allowed = globalPermissions ? globalPermissions.allowed : []

    return (
      <div className="page">
        <div className="page-header">
          <div className="page-header__container">
            <div className="page-header__left">
              <h1 className="page-header__title">Admin</h1>
            </div>
            <div className="page-header__right">
              <SourceIndicator source={source} />
            </div>
          </div>
        </div>
        <FancyScrollbar className="page-contents">
          {users ? (
            <div className="container-fluid">
              <div className="row">
                <AdminTabs
                  users={users}
                  roles={roles}
                  source={source}
                  hasRoles={hasRoles}
                  permissions={allowed}
                  onFilterUsers={filterUsers}
                  onFilterRoles={filterRoles}
                  onEditUser={this.handleEditUser}
                  onEditRole={this.handleEditRole}
                  onSaveUser={this.handleSaveUser}
                  onSaveRole={this.handleSaveRole}
                  onDeleteUser={this.handleDeleteUser}
                  onDeleteRole={this.handleDeleteRole}
                  onClickCreate={this.handleClickCreate}
                  onCancelEditUser={this.handleCancelEditUser}
                  onCancelEditRole={this.handleCancelEditRole}
                  isEditingUsers={users.some(u => u.isEditing)}
                  isEditingRoles={roles.some(r => r.isEditing)}
                  onUpdateRoleUsers={this.handleUpdateRoleUsers}
                  onUpdateUserRoles={this.handleUpdateUserRoles}
                  onUpdateUserPassword={this.handleUpdateUserPassword}
                  onUpdateRolePermissions={this.handleUpdateRolePermissions}
                  onUpdateUserPermissions={this.handleUpdateUserPermissions}
                />
              </div>
            </div>
          ) : (
            <div className="page-spinner" />
          )}
        </FancyScrollbar>
      </div>
    )
  }
}

const mapStateToProps = ({
  admin: {users, roles, permissions},
}: {
  admin: {users: User[]; roles: Role[]; permissions: Permission[]}
}) => ({
  users,
  roles,
  permissions,
})

const mapDispatchToProps = dispatch => ({
  loadUsers: bindActionCreators(loadUsersAsync, dispatch),
  loadRoles: bindActionCreators(loadRolesAsync, dispatch),
  loadPermissions: bindActionCreators(loadPermissionsAsync, dispatch),
  addUser: bindActionCreators(addUser, dispatch),
  addRole: bindActionCreators(addRole, dispatch),
  removeUser: bindActionCreators(deleteUser, dispatch),
  removeRole: bindActionCreators(deleteRole, dispatch),
  editUser: bindActionCreators(editUser, dispatch),
  editRole: bindActionCreators(editRole, dispatch),
  createUser: bindActionCreators(createUserAsync, dispatch),
  createRole: bindActionCreators(createRoleAsync, dispatch),
  deleteUser: bindActionCreators(deleteUserAsync, dispatch),
  deleteRole: bindActionCreators(deleteRoleAsync, dispatch),
  filterUsers: bindActionCreators(filterUsersAction, dispatch),
  filterRoles: bindActionCreators(filterRolesAction, dispatch),
  updateRoleUsers: bindActionCreators(updateRoleUsersAsync, dispatch),
  updateRolePermissions: bindActionCreators(
    updateRolePermissionsAsync,
    dispatch
  ),
  updateUserPermissions: bindActionCreators(
    updateUserPermissionsAsync,
    dispatch
  ),
  updateUserRoles: bindActionCreators(updateUserRolesAsync, dispatch),
  updateUserPassword: bindActionCreators(updateUserPasswordAsync, dispatch),
  notify: bindActionCreators(publishAutoDismissingNotification, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(AdminPage)
