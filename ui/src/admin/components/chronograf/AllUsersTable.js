import React, {Component, PropTypes} from 'react'

import _ from 'lodash'

import {DEFAULT_ORG, NO_ORG} from 'src/admin/constants/dummyUsers'

class ChronografAllUsersTable extends Component {
  constructor(props) {
    super(props)
  }

  handleChooseFilter = filterString => () => {
    this.props.onFilterUsers({name: filterString})
  }

  renderOrgCell = roles => {
    const {organizationName} = this.props

    // Expects Users to always have at least 1 role (as a member of the default org)
    if (roles.length === 1) {
      return (
        <a href="#" onClick={this.handleChooseFilter(NO_ORG)}>
          {NO_ORG}
        </a>
      )
    }

    if (organizationName === DEFAULT_ORG) {
      return roles
        .filter(role => {
          return !(role.organizationName === DEFAULT_ORG)
        })
        .map((role, r) =>
          <span key={r} className="chronograf-user--org">
            <a
              href="#"
              onClick={this.handleChooseFilter(role.organizationName)}
            >
              {role.organizationName}
            </a>
          </span>
        )
    }

    const currentOrg = roles.find(
      role => role.organizationName === organizationName
    )
    return (
      <span className="chronograf-user--org">
        {currentOrg.organizationName}
      </span>
    )
  }

  renderRoleCell = roles => {
    const {organizationName} = this.props

    // Expects Users to always have at least 1 role (as a member of the default org)
    if (roles.length === 1) {
      return <span className="chronograf-user--role">No Role</span>
    }

    if (organizationName === DEFAULT_ORG) {
      return roles
        .filter(role => {
          return !(role.organizationName === DEFAULT_ORG)
        })
        .map((role, r) =>
          <span key={r} className="chronograf-user--role">
            {role.name}
          </span>
        )
    }

    const currentOrg = roles.find(
      role => role.organizationName === organizationName
    )
    return (
      <span className="chronograf-user--role">
        {currentOrg.name}
      </span>
    )
  }
  renderTableRows = filteredUsers => {
    const {onToggleUserSelected, selectedUsers, isSameUser} = this.props

    return filteredUsers.map((user, i) => {
      const isSelected = selectedUsers.find(u => isSameUser(user, u))
      return (
        <tr key={i} className={isSelected ? 'selected' : null}>
          <td
            onClick={onToggleUserSelected(user)}
            className="chronograf-admin-table--check-col chronograf-admin-table--selectable"
          >
            <div className="user-checkbox" />
          </td>
          <td
            onClick={onToggleUserSelected(user)}
            className="chronograf-admin-table--selectable"
          >
            <strong>
              {user.name}
            </strong>
          </td>
          <td>
            {user.superadmin ? 'Yes' : '--'}
          </td>
          <td>
            {this.renderOrgCell(user.roles)}
          </td>
          <td>
            {this.renderRoleCell(user.roles)}
          </td>
          <td>
            {user.provider}
          </td>
          <td className="text-right">
            {user.scheme}
          </td>
        </tr>
      )
    })
  }

  areSameUsers = (usersA, usersB) => {
    const {isSameUser} = this.props
    return !_.differenceWith(usersA, usersB, isSameUser).length
  }

  render() {
    const {filteredUsers, onToggleAllUsersSelected, selectedUsers} = this.props

    const areAllSelected = this.areSameUsers(filteredUsers, selectedUsers)

    return (
      <table className="table table-highlight chronograf-admin-table">
        <thead>
          <tr>
            <th className="chronograf-admin-table--check-col">
              <div
                className={
                  areAllSelected ? 'user-checkbox selected' : 'user-checkbox'
                }
                onClick={onToggleAllUsersSelected(areAllSelected)}
              />
            </th>
            <th>Username</th>
            <th>SuperAdmin</th>
            <th>Organization</th>
            <th>Role</th>
            <th>Provider</th>
            <th className="text-right">Scheme</th>
          </tr>
        </thead>
        <tbody>
          {this.renderTableRows(filteredUsers)}
        </tbody>
      </table>
    )
  }
}

const {arrayOf, func, shape, string} = PropTypes

ChronografAllUsersTable.propTypes = {
  filteredUsers: arrayOf(shape),
  selectedUsers: arrayOf(shape),
  onFilterUsers: func.isRequired,
  onToggleUserSelected: func.isRequired,
  onToggleAllUsersSelected: func.isRequired,
  isSameUser: func.isRequired,
  organizationName: string,
}
export default ChronografAllUsersTable