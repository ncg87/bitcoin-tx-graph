'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Maximize2, RotateCcw, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import dynamic from 'next/dynamic';

// Dynamically import ForceGraph3D with no SSR
const ForceGraph3D = dynamic(() => import('react-force-graph-3d'), {
  ssr: false,
});

const GraphVisualization = () => {
  const containerRef = useRef();
  const graphRef = useRef();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nodeFilters, setNodeFilters] = useState({
    Transaction: true,
    Address: true,
    Output: true
  });
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredElement, setHoveredElement] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [dimensions, setDimensions] = useState({ 
    width: 800, 
    height: 600 
  });

  const nodeColors = {
    Transaction: '#ff6b6b',
    Address: '#4ecdc4',
    Output: '#45b7d1'
  };

  // Handle client-side initialization
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle dimension updates after component is mounted
  useEffect(() => {
    if (!mounted) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width,
          height: window.innerHeight - 200 // Account for header and margins
        });
      }
    };

    // Initial size
    updateDimensions();

    // Add resize listener
    window.addEventListener('resize', updateDimensions);
    
    // Create ResizeObserver for container width changes
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateDimensions);
      resizeObserver.disconnect();
    };
  }, [mounted]);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/graph-data');
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
    
        if (!data.nodes || !data.relationships) {
          throw new Error('Invalid data structure received from API');
        }
    
        const nodes = data.nodes.map(node => ({
          id: node.id,
          label: getNodeLabel(node),
          type: getNodeType(node),
          properties: node.properties,
          color: nodeColors[getNodeType(node)],
          size: getNodeSize(node),
        }));
    
        const links = data.relationships.map(rel => ({
          source: rel.startNode,
          target: rel.endNode,
          type: rel.type,
          properties: rel.properties,
          color: getLinkColor(rel.type)
        }));
    
        setGraphData({ nodes, links });

        // Set initial camera position after data is loaded
        if (mounted && graphRef.current) {
          setTimeout(() => {
            graphRef.current.cameraPosition(
              { x: 200, y: 200, z: 300 },
              { x: 0, y: 0, z: 0 },
              2000
            );
          }, 100);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (mounted) {
      fetchGraphData();
    }
  }, [mounted]);

  const getNodeLabel = (node) => {
    switch (node.labels[0]) {
      case 'Transaction':
        return `Tx: ${node.properties.txid.substring(0, 8)}...`;
      case 'Address':
        return `Addr: ${node.properties.address.substring(0, 8)}...`;
      case 'Output':
        return `Out: ${node.properties.value} BTC`;
      default:
        return 'Unknown';
    }
  };

  const getNodeType = (node) => node.labels[0];

  const getNodeSize = (node) => {
    switch (node.labels[0]) {
      case 'Transaction':
        return 1.2;
      case 'Address':
        return 1.5;
      case 'Output':
        return 1;
      default:
        return 1;
    }
  };

  const getLinkColor = (type) => {
    switch (type) {
      case 'SPENDS':
        return '#ff9f1c';
      case 'CREATES':
        return '#2ec4b6';
      case 'CONTROLS':
        return '#e71d36';
      default:
        return '#cccccc';
    }
  };

  const handleNodeClick = useCallback(node => {
    setSelectedNode(node);
    if (graphRef.current && node) {
      const distance = 100;
      graphRef.current.cameraPosition(
        { 
          x: node.x + distance,
          y: node.y + distance,
          z: node.z + distance
        },
        { x: node.x, y: node.y, z: node.z },
        1000
      );
    }
  }, []);

  const handleZoom = (direction) => {
    if (graphRef.current) {
      const currentDistance = graphRef.current.camera().position.z;
      const newDistance = direction === 'in' ? currentDistance * 0.7 : currentDistance * 1.3;
      graphRef.current.cameraPosition(
        { z: newDistance },
        { x: 0, y: 0, z: 0 },
        1000
      );
    }
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Error loading graph data: {error}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Bitcoin Transaction Network (3D)</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleZoom('in')}>
              <ZoomInIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleZoom('out')}>
              <ZoomOutIcon className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              if (graphRef.current) {
                graphRef.current.cameraPosition(
                  { x: 200, y: 200, z: 300 },
                  { x: 0, y: 0, z: 0 },
                  2000
                );
              }
            }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="space-y-4 mt-4">
          <div className="flex gap-4">
            {Object.entries(nodeFilters).map(([type, enabled]) => (
              <div key={type} className="flex items-center space-x-2">
                <Switch
                  id={`filter-${type}`}
                  checked={enabled}
                  onCheckedChange={(checked) => 
                    setNodeFilters(prev => ({...prev, [type]: checked}))
                  }
                />
                <Label htmlFor={`filter-${type}`}>{type}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <div>
              <Label>Link Distance</Label>
              <Slider
                defaultValue={[80]}
                min={30}
                max={200}
                step={10}
                className="my-2"
                onValueChange={([value]) => {
                  if (graphRef.current) {
                    graphRef.current.d3Force('link').distance(value);
                    graphRef.current.d3ReheatSimulation();
                  }
                }}
              />
            </div>
            <div>
              <Label>Node Repulsion</Label>
              <Slider
                defaultValue={[500]}
                min={100}
                max={1000}
                step={50}
                className="my-2"
                onValueChange={([value]) => {
                  if (graphRef.current) {
                    graphRef.current.d3Force('charge').strength(-value);
                    graphRef.current.d3ReheatSimulation();
                  }
                }}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={containerRef} className="relative w-full border rounded graph-container" style={{ height: `${dimensions.height}px` }}>
          <ForceGraph3D
            ref={graphRef}
            width={dimensions.width}
            height={dimensions.height}
            graphData={graphData}
            nodeColor={node => node.color}
            nodeVal={6}
            nodeLabel={node => node.label}
            linkColor={link => link.color}
            linkWidth={1.5}
            linkDirectionalParticles={2}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.005}
            forceEngine="d3"
            d3Force={('link', 'charge', 'center')}
            d3VelocityDecay={0.3}
            warmupTicks={100}
            cooldownTime={1000}
            onNodeClick={handleNodeClick}
            enableNodeDrag={true}
            enablePointerInteraction={true}
            showNavInfo={true}
          />
        </div>
        {selectedNode && (
          <div className="mt-4 p-4 border rounded">
            <h3 className="font-medium mb-2">Selected Node Details</h3>
            <div className="space-y-1">
              {Object.entries(selectedNode.properties).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span> {value.toString()}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GraphVisualization;