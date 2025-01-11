import { NextResponse } from 'next/server';
import neo4j from 'neo4j-driver';
import dotenv from 'dotenv';

dotenv.config();
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD),
  {
    maxConnectionPoolSize: 50,
  }
);

export async function GET() {
  let session = null;
  try {
    session = driver.session({
      database: 'neo4j',
      defaultAccessMode: neo4j.session.READ
    });

    // Modified query to focus on transaction relationships and increase limit
    const result = await session.run(`
      MATCH (t:Transaction)
      WITH t LIMIT 1000
      MATCH (t)-[r]->(m)
      WHERE type(r) IN ['SPENDS', 'CREATES', 'CONTROLS']
      RETURN 
        collect(distinct {
          id: id(t),
          labels: labels(t),
          properties: { txid: t.txid }
        }) + 
        collect(distinct {
          id: id(m),
          labels: labels(m),
          properties: CASE
            WHEN 'Address' IN labels(m) THEN { address: m.address }
            WHEN 'Output' IN labels(m) THEN { value: m.value }
            ELSE {}
          END
        }) as nodes,
        collect(distinct {
          startNode: id(startNode(r)),
          endNode: id(endNode(r)),
          type: type(r)
        }) as relationships
    `);
    
    const data = {
      nodes: result.records[0].get('nodes').map(node => ({
        id: node.id.toNumber(),
        labels: node.labels,
        properties: node.properties
      })),
      relationships: result.records[0].get('relationships')
        .filter(rel => rel.startNode !== null && rel.endNode !== null)
        .map(rel => ({
          startNode: rel.startNode.toNumber(),
          endNode: rel.endNode.toNumber(),
          type: rel.type
        }))
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ 
      error: error.message
    }, { status: 500 });
  } finally {
    if (session) {
      await session.close();
    }
  }
}