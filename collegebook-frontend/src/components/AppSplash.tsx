import { useEffect, useState } from "react";
import logo from "@/assets/logo.png";

const AppSplash = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="app-splash" role="status" aria-label="Loading CollegeBook">
      <div className="app-splash-content">
        <img className="app-splash-logo" src={logo} alt="" width={260} height={260} />
        <h1>CollegeBook</h1>
        <p>Build Your College Story</p>
      </div>
    </div>
  );
};

export default AppSplash;
