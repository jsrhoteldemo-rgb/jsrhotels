import './InitialLoader.css';

const InitialLoader = () => {
  return (
    <div className="initial-loader-shell" role="status" aria-live="polite" aria-busy="true">
      <div className="initial-loader-card">
        <img
          src="/logo.jpg"
          alt="JSR Hotels Logo"
          className="initial-loader-logo"
          onError={(event) => {
            event.currentTarget.src = '/no-image.svg';
          }}
        />
        <p className="initial-loader-brand">JSR Hotels</p>
        <p className="initial-loader-copy">Loading live website content...</p>
        <div className="initial-loader-track" aria-hidden="true">
          <span className="initial-loader-progress" />
        </div>
      </div>
    </div>
  );
};

export default InitialLoader;
