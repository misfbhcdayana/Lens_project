// @input Asset.ObjectPrefab[] veggiePrefabs
// @input Asset.ObjectPrefab[] fastFoodPrefabs
// @input float spawnInterval = 1.5
// @input float fallSpeed = 10.0
// @input SceneObject headBinding //Head Binding here
// @input Component.FaceStretchVisual faceStretch // Face Stretch here
// @input float eatDistance = 2.0 // Distance threshold for eating

var timer = 0;
var isMouthOpen = false;

//detect mouth state from the Face Mesh/Tracking
script.createEvent("MouthOpenedEvent").bind(function() { isMouthOpen = true; });
script.createEvent("MouthClosedEvent").bind(function() { isMouthOpen = false; });

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
    if (timer >= script.spawnInterval) 
    { 
        spawnFood(); 
        timer = 0; 
    }

    var childrenCount = script.getSceneObject().getChildrenCount();
    var headPos = script.headBinding.getTransform().getWorldPosition();

    for (var i = childrenCount - 1; i >= 0; i--) {
        var child = script.getSceneObject().getChild(i);
        var childTrans = child.getTransform();
        var pos = childTrans.getLocalPosition();

        // 1. Move Food Down
        pos.y -= script.fallSpeed * getDeltaTime();
        childTrans.setLocalPosition(pos);

        // 2. Check "Eating" Condition
        var dist = childTrans.getWorldPosition().distance(headPos);
        
        if (dist < script.eatDistance && isMouthOpen) {
            handleEat(child.isHealthy);
            child.destroy();
            continue; 
        }

        // 3. Cleanup
        if (pos.y < -50) { child.destroy(); }
    }
});
function handleEat(healthy) {
    // FIX: Using feature0Weight is more reliable than getFeatureWeight(0)
    var currentWeight = script.faceStretch.feature0Weight;
    var changeAmount = 0.2; 

    if (healthy) {
        script.faceStretch.feature0Weight = Math.max(0, currentWeight - changeAmount);
        print("Ate Veggie! Weight: " + script.faceStretch.feature0Weight);
    } else {
        script.faceStretch.feature0Weight = Math.min(1, currentWeight + changeAmount);
        print("Ate Junk! Weight: " + script.faceStretch.feature0Weight);
    }
}