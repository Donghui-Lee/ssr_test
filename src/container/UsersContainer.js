import React, { useEffect } from "react";
import Users from "../components/Users";
import { connect } from "react-redux";
import { getUsers } from "../modules/users";
import { Preload } from "../lib/PreloadContext";

const UsersContainer = ({ users, getUsers }) => {
  // 컴포넌트가 마운트되고 나서 호출
  useEffect(() => {
    if (users) {
      // users 가 이미 유효하다면 호출하지 않음.
      return;
    }
    getUsers();
  }, [getUsers, users]);

  return (
    <>
      <Users users={users} />
      <Preload resolve={getUsers} />
    </>
  );
};

export default connect(
  state => ({
    users: state.users.users
  }),
  {
    getUsers
  }
)(UsersContainer);
