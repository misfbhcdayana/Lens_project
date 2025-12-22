//@input SceneObject foodPool
//@input float spawnInterval = 1.5
//@input float lifeTime = 3.0
var foods = [];
var spawnTimer = 0;

// Collect pool
for (var i = 0; i < script.foodPool.getChildrenCount(); i++) {
    var food = script.foodPool.getChild(i);
    food.enabled = false;
    foods.push(food);
}

function spawnFood() {
    for (var i = 0; i < foods.length; i++) {
        if (!foods[i].enabled) {
            var t = foods[i].getTransform();

            t.setWorldPosition(
                new vec3(
                    Math.random() * 200 - 100,
                    50,
                    -150
                )
            );

            foods[i].enabled = true;

            // Auto-despawn
            delayedDisable(foods[i], script.lifeTime);
            return;
        }
    }
}

// Disable after time (DESTROY SUBSTITUTE)
function delayedDisable(obj, delay) {
    var time = 0;

    var evt = script.createEvent("UpdateEvent");
    evt.bind(function (eventData) {
        time += eventData.getDeltaTime();
        if (time >= delay) {
            obj.enabled = false;
            script.removeEvent(evt);
        }
    });
}

function onUpdate(eventData) {
    spawnTimer += eventData.getDeltaTime();

    if (spawnTimer >= script.spawnInterval) {
        spawnFood();
        spawnTimer = 0;
    }
}

script.createEvent("UpdateEvent").bind(onUpdate);