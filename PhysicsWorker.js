'use strict';

importScripts(
    'src/Matrix3D.js',
    'src/Vector3D.js',
    'src/physics/Collider.js',
    'src/physics/BoxCollider.js',
    'src/physics/SphereCollider.js',
    'src/physics/Constraint.js',

    'RigidBody.js'
);

var message = [];

// stage

var rigidBodies = [],
    colliders = [],
    constraints = [];

// solver

var iterations = 5,
    contacts = [];

var gravity = new Vector3D();

// math

var vec = new Vector3D(),
    aMin = new Vector3D(),
    aMax = new Vector3D(),
    bMin = new Vector3D(),
    bMax = new Vector3D();

// public api

var methods = {
    addObject: function(data) {
        var object = new RigidBody();

        switch (data.type) {
            case BoxCollider.BOX_COLLIDER:
                object.collider = new BoxCollider();
                object.collider.center.set(data.center.elements);
                object.collider.extent.set(data.extent.elements);
                break;

            case SphereCollider.SPHERE_COLLIDER:
                object.collider = new SphereCollider(data.center.elements, data.radius);
                break;
        }

        object.collider.inverseMass = data.inverseMass;
        object.collider.restitution = data.restitution;
        object.collider.friction = data.friction;

        object.collider.getAabb(object.aabbMin, object.aabbMax);

        rigidBodies.push(object);
    },
    removeObject: function(index) {
        rigidBodies.splice(index, 1);
    },
    setGravity: function(vector) {
        gravity.set(vector);
    },
    addForce: function(data) {
        rigidBodies[data.index].force.add(vec.set(data.force));
    },
    setPosition: function(data) {
        rigidBodies[data.index].position.set(data.position);
    },
    setRotation: function(data) {
        rigidBodies[data.index].rotation.set(data.rotation);
    },
    setVelocity: function(data) {
        rigidBodies[data.index].velocity.set(data.velocity);
    },
    simulate: function(dt) {
        for (var object, i = 0; object = rigidBodies[i]; i++) {
            var p = object.position,
                r = object.rotation,

                vl = object.linearVelocity,
                va = object.angularVelocity,

                f = object.force,
                t = object.torque,

                im = object.collider.inverseMass,
                dl = object.collider.linearDrag,
                da = object.collider.angularDrag;

            f.addScaled(gravity, object.collider.mass);
            // f.sub(vec.copyFrom(vl).normalize().scale(0.5 * vl.lengthSquared * dl));

            // v += (f / m) * dt

            vl.addScaled(f, im * dt);

            // p += v * dt

            p.addScaled(vl, dt);

            object.matrix.recompose(p.x, p.y, p.z, r.x, r.y, r.z, 1, 1, 1);

            f.set([0, 0, 0]);
            t.set([0, 0, 0]);
        }

        // get contacts

        var numContacts = 0;

        for (var object1, i = 0; object1 = rigidBodies[i]; i++) {
            transformAabb(object1.matrix, object1.aabbMin, object1.aabbMax, aMin, aMax);

            for (var object2, j = i + 1; object2 = rigidBodies[j]; j++) {
                transformAabb(object2.matrix, object2.aabbMin, object2.aabbMax, bMin, bMax);

                if (testAabbAabb(aMin, aMax, bMin, bMax) === false) {
                    continue;
                }

                var contact = contacts[numContacts] || (contacts[numContacts] = new Constraint());

                if (object1.collider instanceof SphereCollider && object2.collider instanceof BoxCollider) {
                    if (testSphereBox(object1, object2, contact)) {
                        contact.object1 = object1;
                        contact.object2 = object2;

                        numContacts++;
                    }
                }
            }
        }

        // resolve collisions

        for (var i = 0; i < iterations; i++) {
            for (var contact, j = 0; j < numContacts; j++) {
                contact = contacts[j];

                resolveCollision(contact.object1, contact.object2, contact.point, contact.normal, contact.distance);
            }
        }

        for (object, i = 0; object = rigidBodies[i]; i++) {
            var offset = i * 3;

            message[offset] = object.position.x;
            message[offset + 1] = object.position.y;
            message[offset + 2] = object.position.z;
        }

        postMessage(message);
    }
};

onmessage = function(event) {
    methods[event.data.method](event.data.arguments);
}

// broad phase

var center = new Vector3D(),
    extent = new Vector3D();

function transformAabb(matrix, localMin, localMax, globalMin, globalMax) {
    center.copyFrom(localMax).add(localMin).scale(0.5);
    extent.copyFrom(localMax).sub(center);

    center.transform(matrix);

    var ex = extent.dot(vec.set(matrix.elements, 0).abs()),
        ey = extent.dot(vec.set(matrix.elements, 4).abs()),
        ez = extent.dot(vec.set(matrix.elements, 8).abs());

    extent.x = ex;
    extent.y = ey;
    extent.z = ez;

    globalMin.copyFrom(center).sub(extent);
    globalMax.copyFrom(center).add(extent);
}

function testAabbAabb(aMin, aMax, bMin, bMax) {
    return !(
        aMin.x > bMax.x || aMax.x < bMin.x ||
        aMin.y > bMax.y || aMax.y < bMin.y ||
        aMin.z > bMax.z || aMax.z < bMin.z
    );
}

// narrow phase

function testSphereSphere(sphereA, sphereB, point, normal) {
    return 0;
}

var globalToLocal = new Matrix3D(),
    localPosition = new Vector3D();

function testSphereBox(sphere, box, contact) {
    var sphereCollider = sphere.collider,
        boxCollider = box.collider;

    var point = contact.point,
        normal = contact.normal;

    // get sphere position in box's local coordinates

    globalToLocal.copyFrom(box.matrix).invert();
    localPosition.copyFrom(sphereCollider.center).transform(sphere.matrix).transform(globalToLocal);

    // get the closest point on box

    point.copyFrom(localPosition);
    point.min(vec.copyFrom(boxCollider.center).add(boxCollider.extent));
    point.max(vec.copyFrom(boxCollider.center).sub(boxCollider.extent));

    normal.copyFrom(localPosition).sub(point);

    if (normal.lengthSquared > sphereCollider.radius * sphereCollider.radius) {
        return false;
    }

    contact.distance = normal.length - sphereCollider.radius;

    // get point and normal in world coordinates

    point.transform(box.matrix);
    normal.normalize().transformDirection(box.matrix);

    return true;
}

var positionA = new Vector3D(),
    positionB = new Vector3D(),
    velocityA = new Vector3D(),
    velocityB = new Vector3D();

function resolveCollision(object1, object2, point, normal, distance) {
    positionA.copyFrom(point).sub(object1.position);
    positionB.copyFrom(point).sub(object2.position);

    object1.getVelocityInPoint(positionA, velocityA);
    object2.getVelocityInPoint(positionB, velocityB);

    // compute combined restitution

    var e = Math.min(object1.collider.restitution, object2.collider.restitution);

    // compute impulse magnitude

    var d1 = object1.getImpulseDenominator(),
        d2 = object2.getImpulseDenominator(),
        j = -(1 + e) * velocityA.sub(velocityB).dot(normal) - distance * 1 / (d1 + d2);

    if (j < 0) {
        return;
    }

    // compute impulse

    vec.copyFrom(normal).scale(j);

    object1.applyImpulse(vec, positionA);
    object2.applyImpulse(vec.negate(), positionB);
}
