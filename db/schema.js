const QUOTE_TABLE = {
    ID: 'id',
    QUOTE: 'quote',
    AUTHOR: 'author'
}

const TAGS_TABLE = {
    ID: 'id',
    NAME: 'name'
}

const QUOTE_TAGS_TABLE = {
    QUOTE_ID: 'quote_id',
    TAG_ID: 'tag_id'
}

const TABLES = {
    'quotes': QUOTE_TABLE,
    'tags': TAGS_TABLE,
    'quote_tags': QUOTE_TAGS_TABLE
}

module.exports = {
    TABLES
}
