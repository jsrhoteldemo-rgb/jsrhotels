import { motion } from 'framer-motion';
import { resolveAssetUrl } from '../config/api';
import { fallbackTeamMembers } from '../data/fallbackContent';
import { usePublicData } from '../hooks/usePublicData';
import { useViewTracker } from '../hooks/useViewTracker';
import type { TeamMember } from '../types/content';

function imageUrl(member: TeamMember) {
  return resolveAssetUrl(member.imageAsset?.url || '/no-image.svg');
}

const Team = () => {
  const { data: members } = usePublicData<TeamMember[]>({
    path: '/api/public/team',
    fallbackData: fallbackTeamMembers,
  });

  useViewTracker({ path: '/team' });

  const visibleMembers = members.filter((item) => item.isVisible).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem', textAlign: 'center' }}
        >
          <h1 style={{ fontSize: '3.2rem', marginBottom: '1rem', color: 'var(--color-accent)' }}>Meet Our Team</h1>
          <p style={{ maxWidth: '700px', color: 'var(--color-text-muted)', fontSize: '1.1rem', margin: '0 auto' }}>
            The leadership team behind JSR Hotels, focused on long-term hospitality excellence.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          {visibleMembers.map((member, index) => (
            <motion.div
              key={member.id}
              className="glass-effect"
              style={{
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
              }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <img
                src={imageUrl(member)}
                alt={member.fullName}
                style={{
                  width: '160px',
                  height: '160px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  objectPosition: 'center top',
                  margin: '0 auto 1.5rem auto',
                  border: '3px solid var(--color-accent)',
                }}
              />
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>{member.fullName}</h3>
              <p
                style={{
                  color: 'var(--color-accent)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  fontSize: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                {member.title}
              </p>
              <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.6, flexGrow: 1 }}>{member.bio}</p>
              {member.profileUrl && (
                <a
                  href={member.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '1.5rem',
                    color: 'var(--color-accent)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                  }}
                >
                  Connect &#8594;
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Team;
