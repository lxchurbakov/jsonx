const execute = (refs, [predicate, ...args]) => {
    const actions = {
        // Pass-through and ref with scope extension
        '@!': (name) => name,
        '@ref': (name) => refs[digest(refs, name)],
        '@extend': (newRefs, expression) => 
            digest({ ...refs, ...digest(refs, newRefs) }, expression),

        // Branching
        '@?': (condition, a, b) => digest(refs, condition) ? digest(refs, a) : digest(refs, b),
        '@=': (a, b) => digest(refs, a) === digest(refs, b),
        '@>': (a, b) => digest(refs, a) > digest(refs, b),
        '@<': (a, b) => digest(refs, a) < digest(refs, b),
        '@??': (a, b) => digest(refs, a) ?? digest(refs, b),

        // Translation and regionalization
        '@translate': (keyset, key) => refs['tankerKeys']?.[digest(refs, keyset)]?.[digest(refs, key)]?.[refs['lang'] ?? DEFAULT_LANG] ?? null,
        '@regionalize': (value) => digest(refs, value)?.[DEFAULT_REGION] ?? null,

        // Array stuff
        '@at': (collection, index) => digest(refs, collection)?.[digest({ ...refs, index }, index)] ?? null,
        '@concat': (...css) => flatten(...css.map((cs) => digest(refs, cs))),
        '@len': (cs) => digest(refs, cs).length,
        '@slice': (cs, a) => digest(refs, cs).slice(digest(refs, a)),
        
        // Calc
        '@-': (a, b) => - digest(refs, b),
        '@+': (a, b) => digest(refs, a) + digest(refs, b),

        // Objects
        '@merge': (a, b) => ({ ...digest(refs, a), ...digest(refs, b) }),
    };

    // Turn every ref into action
    for (let key in refs) {
        if (isExecutable(refs[key])) {
            actions['@' + key] = (...args) => digest({ ...refs, ...digest(refs, args) }, refs[key]);
        }
    }

    if (!actions[predicate]) {
        throw new Error(`Ref ${predicate} is not defined`);
    }

    return actions[predicate](...args);
};

const isExecutable = (value) => {
    return Array.isArray(value)
        && value.length > 0
        && typeof value[0] === 'string'
        && value[0].startsWith('@');
};

export const digest = (refs, value) => {
    if (isExecutable(value)) {
        return execute(refs, value);
    }

    if (Array.isArray(value)) {
        return value.map((item, index) => {
            return digest({ ...refs, index }, item);
        });
    }

    if (value === null) {
        return null;
    }

    if (typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value).map(([index, $]) => {
                return [index, digest({ ...refs, index }, $)];
            })
        );
    }

    return value;
};


