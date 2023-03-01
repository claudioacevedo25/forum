import React from "react";
import {
  NovuProvider,
  PopoverNotificationCenter,
  NotificationBell,
} from "@novu/notification-center";
import { useNavigate } from "react-router-dom";

const Nav = () => {
  const navigate = useNavigate();

  const onNotificationClick = (notification) =>
    navigate(notification.cta.data.url);

  const signOut = () => {
    localStorage.removeItem("_id");
    navigate("/");
  };
  return (
    <nav className="navbar">
      <h2>Threadify</h2>

      <div className="navbarRight">
        <NovuProvider
          subscriberId="89af7968f8d1d4826598db29b8c53360"
          applicationIdentifier="PE0br1VfR7Qg"
        >
          <PopoverNotificationCenter
            onNotificationClick={onNotificationClick}
            colorScheme="light"
          >
            {({ unseenCount }) => (
              <NotificationBell unseenCount={unseenCount} />
            )}
          </PopoverNotificationCenter>
        </NovuProvider>

        <button onClick={signOut}>Sign out</button>
      </div>
    </nav>
  );
};
export default Nav;
