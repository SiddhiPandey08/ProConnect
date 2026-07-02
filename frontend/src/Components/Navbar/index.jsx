import React from "react";
import styles from "./styles.module.css";
import { useRouter } from "next/router";
import { useSelector, useDispatch } from "react-redux";
import { reset } from "../../config/redux/reducer/authReducer/index";
export default function NavbarComponent() {
  const router = useRouter();

  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <img
          onClick={() => router.push("/")}
          style={{ cursor: "pointer" }}
          className={styles.logoImage}
          src="/images/prconnect.png"
          alt="ProConnect"
        ></img>
        <div className={styles.navBarOptionContainer}>
          {authState.profileFetched && (
            <div className={styles.authActions}>
              <p className={styles.welcomeText}>
                Welcome, {authState.user.userId.name}!
              </p>
              <p
                className={styles.navLink}
                onClick={() => router.push("/profile")}
              >
                Profile
              </p>
              {authState.loggedIn && (
                <p
                  className={styles.navLink}
                  onClick={() => {
                    localStorage.removeItem("token");
                    router.push("/");
                    dispatch(reset());
                  }}
                >
                  Logout
                </p>
              )}
            </div>
          )}
          {!authState.profileFetched && (
            <div
              onClick={() => router.push("/login")}
              className={styles.buttonJoin}
            >
              Join ProConnect
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
