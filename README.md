# Bitcoin Transaction Network Visualization

## Overview
This project provides a 3D interactive visualization of Bitcoin transaction networks using Neo4j as the backend database and Next.js for the frontend. The visualization helps users understand and explore the relationships between Bitcoin transactions, addresses, and outputs in an intuitive way.

## Features
- **3D Force-Directed Graph**: Interactive visualization of the Bitcoin transaction network
- **Node Types**:
  - Transactions (Red)
  - Addresses (Teal)
  - Outputs (Light Blue)
- **Relationship Types**:
  - SPENDS (Orange)
  - CREATES (Turquoise)
  - CONTROLS (Red)
- **Interactive Controls**:
  - Node dragging and repositioning
  - Zoom in/out capabilities
  - Camera reset
  - Node type filtering
  - Force layout adjustments (link distance and node repulsion)
- **Node Selection**: Click on nodes to focus the camera and view detailed information
- **Responsive Design**: Automatically adjusts to viewport size

## Technical Stack
- **Frontend**:
  - Next.js
  - React Force Graph 3D
  - Tailwind CSS
  - shadcn/ui components
- **Backend**:
  - Neo4j Database
  - Neo4j Bolt Driver
- **Data Processing**:
  - Custom Neo4j queries for efficient graph data retrieval
  - Client-side force layout calculations

## Setup Instructions

### Prerequisites
1. Node.js (v14 or higher)
2. Neo4j Database (v4.x or higher)
3. npm or yarn package manager

### Installation Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd bitcoin-transaction-visualization
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up Neo4j:
- Ensure Neo4j is running
- Create a new database or use an existing one
- Update the connection settings in `route.js`:
```javascript
const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'your-password'),
  {
    encrypted: false,
    trust: 'TRUST_ALL_CERTIFICATES',
    maxConnectionPoolSize: 50,
  }
);
```

4. Install required shadcn/ui components:
```bash
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add card
npx shadcn-ui@latest add switch
npx shadcn-ui@latest add label
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add button
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Usage Guide

### Basic Navigation
- **Pan**: Click and drag in empty space
- **Rotate**: Right-click and drag
- **Zoom**: Mouse wheel or use zoom buttons
- **Reset View**: Click the reset button (circular arrow icon)

### Interacting with Nodes
- **Select Node**: Click on any node to focus the camera on it and view its details
- **Drag Node**: Click and drag nodes to reposition them
- **View Details**: Node information appears in a panel below the visualization when selected

### Customizing the View
1. **Node Filtering**:
   - Use the toggle switches at the top to show/hide different node types
   - Filter between Transactions, Addresses, and Outputs

2. **Force Layout Adjustment**:
   - Link Distance: Adjust the spacing between connected nodes
   - Node Repulsion: Control how strongly nodes push away from each other

## Data Structure

### Node Types
1. **Transaction Nodes**:
   - Properties: txid
   - Color: #ff6b6b

2. **Address Nodes**:
   - Properties: address
   - Color: #4ecdc4

3. **Output Nodes**:
   - Properties: value (in BTC)
   - Color: #45b7d1

### Relationship Types
1. **SPENDS**: Connects transactions to outputs (Orange)
2. **CREATES**: Shows output creation (Turquoise)
3. **CONTROLS**: Links addresses to outputs (Red)

## Performance Considerations
- The visualization is optimized for up to 200 transaction nodes
- Uses Level of Detail (LOD) rendering for better performance
- Implements efficient Neo4j queries with property filtering
- Responsive design with dynamic sizing
- Force layout parameters are tuned for optimal visualization

## Troubleshooting

### Common Issues and Solutions

1. **Graph Not Loading**:
   - Check Neo4j connection settings
   - Ensure database is running
   - Verify network connectivity

2. **Performance Issues**:
   - Reduce the number of nodes in the query
   - Adjust force layout parameters
   - Check browser console for errors

3. **Display Problems**:
   - Clear browser cache
   - Refresh the page
   - Check for console errors

## Contributing
Contributions are welcome! Please feel free to submit pull requests or create issues for bugs and feature requests.

## License
MIT