import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import User from "../components/User";
import { Preload } from "../lib/PreloadContext";
import { getUser } from "../modules/users";

const UserContainer = ({ id }) => {
  const user = useSelector(state => state.users.user);
  const dispatch = useDispatch();

  useEffect(() => {
    // 사용자가 존재, id 일치 시 요청하지 않음
    if (user && user.id === parseInt(id, 10)) {
      return;
    }

    dispatch(getUser(id));
  }, [dispatch, id, user]);

  // 컨테이너 유효성 검사 후 return null 을 해야 하는 경우에 null 대신 Preloader 반환
  if (!user) {
    return <Preload resolve={() => dispatch(getUser(id))} />;
  }
  return <User user={user} />;
};

export default UserContainer;
