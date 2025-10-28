const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const RECIPES_FILE = path.join(__dirname, 'recipes.json');
function readRecipes(){ try{ return JSON.parse(fs.readFileSync(RECIPES_FILE)); }catch(e){ return []; } }

app.get('/', (req,res)=> res.json({status:'ok', service:'MealMind JSON backend'}));
app.get('/api/recipes', (req,res)=> res.json(readRecipes()));
app.get('/api/recipes/search', (req,res)=> {
  const q = (req.query.q||'').toLowerCase();
  const out = readRecipes().filter(r=> r.name.toLowerCase().includes(q) || (r.tags||[]).some(t=>t.includes(q)));
  res.json(out);
});
app.post('/api/plan', (req,res)=> {
  const body = req.body || {};
  const people = Number(body.people)||2;
  const days = Number(body.days)||7;
  const mealTypes = body.mealTypes || {breakfast:true,lunch:true,dinner:true};
  const allergies = (body.allergies||'').split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
  let recipes = readRecipes();
  const types = Object.keys(mealTypes).filter(k=>mealTypes[k]);
  recipes = recipes.filter(r=> types.includes(r.mealType));
  recipes = recipes.filter(r=>{
    const ingr = (r.ingredients||[]).join(' ').toLowerCase();
    for(const a of allergies) if(a && ingr.includes(a)) return false;
    return true;
  });
  recipes.sort((a,b)=> (a.estimatedCost||0) - (b.estimatedCost||0));
  const plan = [];
  let used = new Set();
  for(let d=0; d<days; d++){
    const day={day:d+1, meals:[]};
    for(const slot of types){
      const pick = recipes.find(r=> r.mealType===slot);
      if(pick){ used.add(pick.id); day.meals.push({slot, id:pick.id, name:pick.name, perMealCost: Number(((pick.estimatedCost||0)*people/(pick.servings||1)).toFixed(2))}); }
      else day.meals.push({slot, id:null, name:'(Žiadna voľba)', perMealCost:0});
    }
    plan.push(day);
  }
  // simple shopping list
  const shopping = {};
  for(const id of Array.from(used)){
    const r = recipes.find(x=> x.id===id) || readRecipes().find(x=> x.id===id);
    if(!r) continue;
    for(const ing of r.ingredients || []){
      const key = ing;
      shopping[key] = shopping[key] || {name:ing, qtys:[]};
      shopping[key].qtys.push('1x');
    }
  }
  const shoppingList = Object.keys(shopping).map(k=> ({name:shopping[k].name, notes:shopping[k].qtys.join(', ')}));
  res.json({plan, shoppingList});
});

// admin add recipe (demo, no auth)
app.post('/api/admin/recipe', (req,res)=>{
  const r = req.body;
  const recipes = readRecipes();
  r.id = Math.floor(Math.random()*1000000);
  recipes.push(r);
  fs.writeFileSync(RECIPES_FILE, JSON.stringify(recipes, null, 2));
  res.json({ok:true, id:r.id});
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log('MealMind JSON backend listening on', PORT));
