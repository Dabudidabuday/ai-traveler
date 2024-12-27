export const SaveRoute = ({ routeUrl }: {routeUrl?: string}) => {
  return (
    <>
      {routeUrl && (
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          backgroundColor: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          <a 
            href={routeUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              textDecoration: 'none',
              color: '#1976d2',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Save Route</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
            </svg>
          </a>
        </div>
      )}
    </>
  );
};
