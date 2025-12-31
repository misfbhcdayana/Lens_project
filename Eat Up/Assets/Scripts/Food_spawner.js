// @input Asset.ObjectPrefab[] veggiePrefabs
// @input Asset.ObjectPrefab[] fastFoodPrefabs
// @input float spawnInterval = 1.5
// @input float fallSpeed = 10.0

var timer = 0;

function spawnFood() {
    // 1. Randomly decide: Veggie (0) or Fast Food (1)?
    var isVeggie = Math.random() > 0.5;
    var selectedArray = isVeggie ? script.veggiePrefabs : script.fastFoodPrefabs;
    
    // 2. Pick a random prefab from that array
    var randomIndex = Math.floor(Math.random() * selectedArray.length);
    var foodPrefab = selectedArray[randomIndex];
    
    if (!foodPrefab) return;

    // 3. Instantiate the food
    var newFood = foodPrefab.instantiate(script.getSceneObject());
    
    // 4. Set random starting position at the top
    var screenWidth = 20;
    var randomX = (Math.random() * screenWidth) - (screenWidth / 2);
    newFood.getTransform().setLocalPosition(new vec3(randomX, 30, 0));

    // 5. Add a "Type" property so we know what it is when we eat it
    newFood.foodType = isVeggie ? "healthy" : "unhealthy";
}

script.createEvent("UpdateEvent").bind(function() {
    timer += getDeltaTime();
    
    if (timer >= script.spawnInterval) {
        spawnFood();
        timer = 0;
    }

    var childrenCount = script.getSceneObject().getChildrenCount();
    
    // FIX: Loop backwards so destroying an object doesn't break the index
    for (var i = childrenCount - 1; i >= 0; i--) {
        var child = script.getSceneObject().getChild(i);
        
        if (!child) continue;

        var pos = child.getTransform().getLocalPosition();
        pos.y -= script.fallSpeed * getDeltaTime();
        child.getTransform().setLocalPosition(pos);

        // Delete food if it falls off screen (adjust -30 if needed)
        if (pos.y < -30) {
            child.destroy();
        }
    }
});