import { useEffect, useState } from "react";

const AppSplash = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setVisible(false), 1500);
    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) return null;

  return (
    <div className="app-splash" role="status" aria-label="Loading CollegeBook" />
  );
};

export default AppSplash;
