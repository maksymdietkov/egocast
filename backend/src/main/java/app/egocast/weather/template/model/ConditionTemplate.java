package app.egocast.weather.template.model;

import java.util.List;

public class ConditionTemplate {
    private List<WeightedText> intro;
    private List<WeightedText> advice;
    private List<WeightedText> sting;

    public List<WeightedText> getIntro() { return intro; }
    public void setIntro(List<WeightedText> intro) { this.intro = intro; }

    public List<WeightedText> getAdvice() { return advice; }
    public void setAdvice(List<WeightedText> advice) { this.advice = advice; }

    public List<WeightedText> getSting() { return sting; }
    public void setSting(List<WeightedText> sting) { this.sting = sting; }
}