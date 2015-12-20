import DS from 'ember-data';

export default DS.Model.extend({
    hasMine: DS.attr('boolean', { defaultValue: false }),
    isMarked: DS.attr('boolean', { defaultValue: false }),
    isOpened: DS.attr('boolean', { defaultValue: false }),
    value: DS.attr(),
    xPos: DS.attr(),
    yPos: DS.attr()
});
