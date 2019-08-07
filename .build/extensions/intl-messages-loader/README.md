# Intl messages loader

Use for load and process translations for `react-intl` component.

Takes structure like:

```
{
    "id.prefix": {
        "id1": "Default message value",
        "id2": {
            defaultMessage: "Default message value 2",
            description: "Verbose description for translator"
        }
    }
}
```

and converts to structure to use together to `react-intl`:

```
{
    "id1": {
        "id": "id.prefix.id1",
        "defaultMessage": "Default message value"
    },
    "id2": {
        "id": "id.prefix.id2",
        "defaultMessage": "Default message value 2"
        "description": "Verbose description for translator"
    }
}
```

## Usage

```
const messages = require("!json!intl-messages!yaml!./messages.yml")
```
