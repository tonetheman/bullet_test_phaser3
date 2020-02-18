

# change movement

move towards pointer

compute angle from  player to pointer

Math.atan2(ptr.y-player.y,ptr.x-player.x);

then do same sort of
velx = Math.cos(angle) * speed;
vely = Math.sin(angle) * speed;