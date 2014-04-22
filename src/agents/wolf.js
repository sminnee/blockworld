function animationsFor(animal) {
  return {
    'walk-right': [
      [animal + '-right-1',3],
      [animal + '-right-2',3],
      [animal + '-right-3',3],
      [animal + '-right-2',3]
    ],
    'walk-left': [
      [animal + '-left-1',3],
      [animal + '-left-2',3],
      [animal + '-left-3',3],
      [animal + '-left-2',3]
    ],
    'walk-up': [
      [animal + '-up-1',3],
      [animal + '-up-2',3],
      [animal + '-up-3',3],
      [animal + '-up-2',3]
    ],
    'walk-down': [
      [animal + '-down-1',3],
      [animal + '-down-2',3],
      [animal + '-down-3',3],
      [animal + '-down-2',3]
    ]
  };
}

return {
  'animations' : animationsFor('wolf'),

  'tick' : function(agent, world) {
    agent.move(agent.dX,agent.dY);

    var cell = world.getTileset().getCell(this.i,this.j);
    if(!cell || cell.type != 'grass') {
      if(agent.dX < 0) agent.setDirection(DIR_RIGHT);
      else if(agent.dX > 0) agent.setDirection(DIR_LEFT);
      else if(agent.dY < 0) agent.setDirection(DIR_BOTTOM);
      else if(agent.dY > 0) agent.setDirection(DIR_TOP);

      agent.move(agent.dX, agent.dY);
      return true;
      }

    if(Math.random() > 0.99) {
      agent.setDirection(Math.floor(Math.random()*4)*2+1);
      return true;
    }

    return false;
  }
};