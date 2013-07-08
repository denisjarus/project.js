function Event3D(type) {
    Object.defineProperties(this, {
        type: { value: type },
        target: { value: null, writable: true },
        currentTarget: { value: null, writable: true }
    });
}

Object.defineProperties(Event3D, {
    ADDED: { value: 'added' },
    REMOVED: { value: 'removed' },
    GEOMETRY_CHANGE: { value: 'geometryChange' },
    MATERIAL_CHANGE: { value: 'materialChange' },
    MATERIAL_SHADER_CHANGE: { value: 'materialShaderChange' },
});