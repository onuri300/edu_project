import {owner,db,failure} from '@/lib/server';
import {canvaConfigured} from '@/lib/canva';
export async function GET(){try{const user=await owner();const configured=canvaConfigured();const connected=configured?!!await db().prepare('SELECT owner FROM canva_connections WHERE owner=?').bind(user).first():false;return Response.json({configured,connected},{headers:{'Cache-Control':'no-store'}});}catch(e){return failure(e);}}
