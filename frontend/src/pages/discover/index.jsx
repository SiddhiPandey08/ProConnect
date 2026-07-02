import React from "react";
import UserLayout from "@/layouts";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getAllUsers } from "@/config/redux/action/authAction/index.js";
import styles from "./styles.module.css";
import { BASE_URL } from "@/config/index.jsx";
import { useRouter } from "next/router";

export default function discoverComponent() {
  const router = useRouter();
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  useEffect(() => {
    if (authState.all_users_fetched === false) {
      dispatch(getAllUsers());
    }
  }, [authState.all_users_fetched, dispatch]);

  return (
    <UserLayout>
      <DashboardLayout>
        <div>
          <h1>Discover</h1>
          <div className={styles.allUsersProfile}>
            {authState.all_users_fetched &&
              authState.all_users.map((user) => {
                return (
                  <div
                    onClick={() =>
                      router.push(`/viewProfile/${user.userId.username}`)
                    }
                    key={user._id}
                    className={styles.userProfileCard}
                  >
                    <h2>{user.userId.name}</h2>

                    <p>{user.userId.username}</p>
                    <img
                      className={styles.userProfileImage}
                      width={100}
                      src={`${BASE_URL}/${user.userId.profilePicture}`}
                      alt="Profile"
                    />

                    <p>{user.currentPosition}</p>
                  </div>
                );
              })}
          </div>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
