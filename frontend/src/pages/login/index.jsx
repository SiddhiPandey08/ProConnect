import React, { useEffect, useState } from "react";
import UserLayout from "@/layouts";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/router";
import styles from "./styles.module.css";

import { loginUser, registerUser } from "@/config/redux/action/authAction";
import { emptyMessage } from "@/config/redux/reducer/authReducer";

export default function LoginComponent() {
  const authState = useSelector((state) => state.auth);
  const router = useRouter();

  const [userLoginMethod, setUserLoginMethod] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (authState?.loggedIn) {
      router.push("/dashboard");
    }
  }, [authState.loggedIn]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, []);

  useEffect(() => {
    dispatch(emptyMessage());
  }, [userLoginMethod]);

  const handleRegister = () => {
    dispatch(registerUser({ email, password, name, username }));
  };

  const handleLogin = () => {
    dispatch(loginUser({ email, password }));
  };

  return (
    <UserLayout>
      <div className={styles.container}>
        <div className={styles.cardContainer}>
          <div className={styles.cardContainer_left}>
            <div className={styles.brandMark}>PC</div>

            <div className={styles.headingBlock}>
              <p className={styles.cardContainer_left_heading}>
                {userLoginMethod ? "Welcome back" : "Create account"}
              </p>
              <p className={styles.subheading}>
                {userLoginMethod
                  ? "Sign in to your ProConnect account"
                  : "Join the professional network"}
              </p>
            </div>

            {authState.message && (
              <p
                className={styles.statusMessage}
                style={{ color: authState?.isError ? "#dc2626" : "#16a34a" }}
              >
                {authState.message}
              </p>
            )}

            <div className={styles.inputContainer}>
              {!userLoginMethod && (
                <div className={styles.inputRow}>
                  <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Username</label>
                    <input
                      className={styles.inputField}
                      type="text"
                      placeholder="Username"
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Full name</label>
                    <input
                      className={styles.inputField}
                      type="text"
                      placeholder="Name"
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className={styles.inputWrapper}>
                <label className={styles.inputLabel}>Email</label>
                <input
                  className={styles.inputField}
                  type="text"
                  placeholder="Email"
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={styles.inputWrapper}>
                <label className={styles.inputLabel}>Password</label>
                <input
                  className={styles.inputField}
                  type="password"
                  placeholder="Password"
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div
              onClick={() =>
                userLoginMethod ? handleLogin() : handleRegister()
              }
              className={`buttonWithoutOutline ${styles.submitBtn}`}
            >
              <p>{userLoginMethod ? "Sign in" : "Create account"}</p>
            </div>

            <p className={styles.toggleText}>
              {userLoginMethod
                ? "Don't have an account? "
                : "Already have an account? "}
              <span
                className={styles.toggleLink}
                onClick={() => setUserLoginMethod(!userLoginMethod)}
              >
                {userLoginMethod ? "Register" : "Sign in"}
              </span>
            </p>
          </div>

          <div className={styles.cardContainer_right}>
            <div className={styles.rightContent}>
              <div className={styles.rightQuote}>
                "Your network is your net worth."
              </div>
              <p className={styles.rightSub}>
                Connect with professionals, discover opportunities, and grow
                your career.
              </p>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
