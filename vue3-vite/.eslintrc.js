module.exports = {
    "env": {
        "browser": true,
        'es2021': true
    },
    "dlobals": {
        defineEmits: "readonly",
        defineProps: 'readonly',
        defineExpose: 'readonly',
        withDefaults: 'readonly',
    },
    "extends": [
        "plugin:vue/vue3-strongly-recommended",
        "standard"
    ],
    "parserOptions": {
        "ecmaVersion": 13,
        "parser": "@typescript-eslint/parser",
        "sourceType": "module"
    },
    "plugins": [
        "vue",
        "@typescript-eslint"
    ],
    "rules": {
        "no-unused-vars": "off"
    }
}
