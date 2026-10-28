const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=process.cwd(),dir=path.join(root,'validation/release-baseline-20261028');
const hashes=JSON.parse(fs.readFileSync(path.join(dir,'source-sha256.json'))),allowed=JSON.parse(fs.readFileSync(path.join(dir,'allowed-changes.json')));
const changes=[];for(const [name,hash] of Object.entries(hashes)){const p=path.join(root,'src',name);assert(fs.existsSync(p),'Missing production source: '+name);if(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==hash)changes.push(name);}
assert.deepStrictEqual(changes.sort(),allowed.slice().sort(),'Unexpected modification of production pages');
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.relative(path.join(root,'src'),path.join(p,e.name))]);
assert.deepStrictEqual(walk(path.join(root,'src')).sort(),Object.keys(hashes).sort(),'Unexpected added or removed source');
const source=fs.readFileSync('src/app/routes/outbound/order/order.component.ts','utf8');
assert(source.includes('quantity-allocation/entry'));assert(source.includes('openingUnpickId'));assert(source.includes('Unpick could not be confirmed'));
console.log(JSON.stringify({baselineFiles:Object.keys(hashes).length,unchangedFiles:Object.keys(hashes).length-changes.length,intentionalChanges:changes,unexpectedChanges:0}));
