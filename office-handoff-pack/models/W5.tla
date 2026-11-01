---- MODULE W5 ----
EXTENDS Naturals
VARIABLES s, cups, tired
vars == <<s, cups, tired>>
Init == s = "asleep" /\ cups = 0 /\ tired = FALSE
WakeUp == s = "asleep" /\ s' = "coffee" /\ cups' = 1 /\ UNCHANGED tired
Hack == s = "coffee" /\ cups >= 1 /\ s' = "project" /\ tired' = TRUE /\ UNCHANGED cups
Nap == s = "project" /\ tired /\ s' = "nap" /\ tired' = FALSE /\ UNCHANGED cups
Refill == s = "nap" /\ cups < 2 /\ s' = "coffee" /\ cups' = cups + 1 /\ UNCHANGED tired
Dinner == s = "nap" /\ s' = "dinner" /\ UNCHANGED <<cups, tired>>
Night == s = "dinner" /\ s' = "night" /\ UNCHANGED <<cups, tired>>
Next == WakeUp \/ Hack \/ Nap \/ Refill \/ Dinner \/ Night
Spec == Init /\ [][Next]_vars
ProjectNeedsCoffee == s = "project" => cups >= 1
NeverNapRested == s = "nap" => ~tired
====
