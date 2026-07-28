package app.egocast.weather.template.model;

import java.util.Map;

public class TonePackDefinition {
    private Map<String, ConditionTemplate> conditions;
    private ExpandTemplate expand;

    public Map<String, ConditionTemplate> getConditions() { return conditions; }
    public void setConditions(Map<String, ConditionTemplate> conditions) { this.conditions = conditions; }

    public ExpandTemplate getExpand() { return expand; }
    public void setExpand(ExpandTemplate expand) { this.expand = expand; }
}