import './BabyloneLogo.css'

type Vertex = { x: number; y: number }

const BabyloneLogo = () => {
  const size = 200
  const center = size / 2
  const radius = 75
  const nodeRadius = 5
  
  const vertices: Vertex[] = []
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 - Math.PI / 2
    const x = center + radius * Math.cos(angle)
    const y = center + radius * Math.sin(angle)
    vertices.push({ x, y })
  }

  return (
    <svg
      className="babylone-logo-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Red octagon lines connecting vertices */}
      {vertices.map((vertex, i) => {
        const nextVertex = vertices[(i + 1) % 8]
        return (
          <line
            key={`line-${i}`}
            x1={vertex.x}
            y1={vertex.y}
            x2={nextVertex.x}
            y2={nextVertex.y}
            stroke="#E53935"
            strokeWidth="2.5"
          />
        )
      })}
      
      {/* Light blue parallel lines on each red segment */}
      {vertices.map((vertex, i) => {
        const nextVertex = vertices[(i + 1) % 8]
        const segmentLength = Math.sqrt(
          Math.pow(nextVertex.x - vertex.x, 2) + Math.pow(nextVertex.y - vertex.y, 2)
        )
        const angle = Math.atan2(nextVertex.y - vertex.y, nextVertex.x - vertex.x)
        const perpAngle = angle + Math.PI / 2
        
        // Position lines at 1/3 and 2/3 of each segment
        const pos1 = 0.33
        const pos2 = 0.67
        const lineLength = segmentLength * 0.15
        const offset = 6
        
        // First pair of parallel lines
        const x1_1 = vertex.x + (nextVertex.x - vertex.x) * pos1 + Math.cos(perpAngle) * offset
        const y1_1 = vertex.y + (nextVertex.y - vertex.y) * pos1 + Math.sin(perpAngle) * offset
        const x2_1 = x1_1 + Math.cos(angle) * lineLength
        const y2_1 = y1_1 + Math.sin(angle) * lineLength
        
        const x1_2 = vertex.x + (nextVertex.x - vertex.x) * pos1 + Math.cos(perpAngle) * -offset
        const y1_2 = vertex.y + (nextVertex.y - vertex.y) * pos1 + Math.sin(perpAngle) * -offset
        const x2_2 = x1_2 + Math.cos(angle) * lineLength
        const y2_2 = y1_2 + Math.sin(angle) * lineLength
        
        // Second pair of parallel lines
        const x1_3 = vertex.x + (nextVertex.x - vertex.x) * pos2 + Math.cos(perpAngle) * offset
        const y1_3 = vertex.y + (nextVertex.y - vertex.y) * pos2 + Math.sin(perpAngle) * offset
        const x2_3 = x1_3 + Math.cos(angle) * lineLength
        const y2_3 = y1_3 + Math.sin(angle) * lineLength
        
        const x1_4 = vertex.x + (nextVertex.x - vertex.x) * pos2 + Math.cos(perpAngle) * -offset
        const y1_4 = vertex.y + (nextVertex.y - vertex.y) * pos2 + Math.sin(perpAngle) * -offset
        const x2_4 = x1_4 + Math.cos(angle) * lineLength
        const y2_4 = y1_4 + Math.sin(angle) * lineLength
        
        return (
          <g key={`parallel-${i}`}>
            <line
              x1={x1_1}
              y1={y1_1}
              x2={x2_1}
              y2={y2_1}
              stroke="#87CEEB"
              strokeWidth="2"
            />
            <line
              x1={x1_2}
              y1={y1_2}
              x2={x2_2}
              y2={y2_2}
              stroke="#87CEEB"
              strokeWidth="2"
            />
            <line
              x1={x1_3}
              y1={y1_3}
              x2={x2_3}
              y2={y2_3}
              stroke="#87CEEB"
              strokeWidth="2"
            />
            <line
              x1={x1_4}
              y1={y1_4}
              x2={x2_4}
              y2={y2_4}
              stroke="#87CEEB"
              strokeWidth="2"
            />
          </g>
        )
      })}
      
      {/* Red circular nodes at vertices */}
      {vertices.map((vertex, i) => (
        <circle
          key={`node-${i}`}
          cx={vertex.x}
          cy={vertex.y}
          r={nodeRadius}
          fill="#E53935"
        />
      ))}
      
      {/* Central letter "b" in light blue */}
      <text
        x={center}
        y={center + 35}
        fontSize="110"
        fontWeight="bold"
        fill="#87CEEB"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Arial, sans-serif"
        style={{ fontStyle: 'normal' }}
      >
        b
      </text>
    </svg>
  )
}

export default BabyloneLogo

