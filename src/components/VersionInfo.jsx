const VersionInfo = () => {
  const info = process.env.REACT_APP_VERSION_INFO;
  if (!info) {
    console.info("No version information present at build time.");
    return <></>;
  }
  console.info(`version: ${info}`);
  return <div className="version-info my-2 text-center text-secondary">{info}</div>;
};

export default VersionInfo;