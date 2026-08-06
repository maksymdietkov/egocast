package app.egocast.weather.template.model;

import java.util.List;
import java.util.Map;

public class ExpandTemplate {
    private List<String> trigger;
    private Map<String, String> temp;
    private Map<String, Map<String, String>> params;

    public List<String> getTrigger() { return trigger; }
    public void setTrigger(List<String> trigger) { this.trigger = trigger; }

    public Map<String, String> getTemp() { return temp; }
    public void setTemp(Map<String, String> temp) { this.temp = temp; }

    public Map<String, Map<String, String>> getParams() { return params; }
    public void setParams(Map<String, Map<String, String>> params) { this.params = params; }
}