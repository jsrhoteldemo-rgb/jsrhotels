import { motion } from 'framer-motion';
import './Portfolio.css';

const rooms = [
  {
    id: 1,
    title: 'The Grand Suite',
    description: 'Breathtaking city views with expansive living spaces and luxury amenities.',
    image: '/room-demo.png'
  },
  {
    id: 2,
    title: 'Ocean View Retreat',
    description: 'Wake up to the sound of waves in this serene, beautifully appointed setting.',
    image: '/suite-ocean.png'
  },
  {
    id: 3,
    title: 'Executive Penthouse',
    description: 'The pinnacle of luxury featuring rich textiles and panoramic city views.',
    image: '/suite-penthouse.png'
  },
  {
    id: 4,
    title: 'Deluxe Courtyard Room',
    description: 'A quiet escape overlooking our lush interior gardens and luxury lounge.',
    image: '/lobby-demo.png'
  }
];

const Portfolio = () => {
  return (
    <div className="page-wrapper inner-page-padding">
      <div className="container section-padding">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ marginBottom: '4rem' }}
        >
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--color-text-main)' }}>Our Portfolio</h1>
          <p style={{ maxWidth: '600px', color: 'var(--color-text-muted)' }}>
            Discover our collection of meticulously designed rooms and suites, tailored to provide the ultimate comfort and elegance.
          </p>
        </motion.div>

        <div className="portfolio-grid">
          {rooms.map((room, index) => (
            <motion.div 
              key={room.id}
              className="portfolio-card glass-effect"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="portfolio-img-wrapper img-hover-scale">
                <img src={room.image} alt={room.title} />
              </div>
              <div className="portfolio-content">
                <h3>{room.title}</h3>
                <p>{room.description}</p>
                <button className="link-accent" style={{ marginTop: '1rem' }}>View Details &#8594;</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
