---- MODULE W1 ----
VARIABLES s, lc, rush
vars == <<s, lc, rush>>
Init == s = "quoted" /\ lc = FALSE /\ rush = FALSE
MarkRush == s = "quoted" /\ ~rush /\ rush' = TRUE /\ UNCHANGED <<s, lc>>
Sign == s = "quoted" /\ s' = "contracted" /\ UNCHANGED <<lc, rush>>
OpenLC == s = "contracted" /\ s' = "lcOpen" /\ lc' = TRUE /\ UNCHANGED rush
Load == s = "lcOpen" /\ s' = "loaded" /\ UNCHANGED <<lc, rush>>
RushLoad == s = "contracted" /\ rush /\ s' = "loaded" /\ UNCHANGED <<lc, rush>>
Ship == s = "loaded" /\ s' = "shipped" /\ UNCHANGED <<lc, rush>>
Deliver == s = "shipped" /\ s' = "delivered" /\ UNCHANGED <<lc, rush>>
Next == MarkRush \/ Sign \/ OpenLC \/ Load \/ RushLoad \/ Ship \/ Deliver
Spec == Init /\ [][Next]_vars
LoadedNeedsLC == s \in {"loaded","shipped","delivered"} => lc
====
