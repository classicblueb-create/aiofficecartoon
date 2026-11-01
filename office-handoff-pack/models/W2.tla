---- MODULE W2 ----
VARIABLES s, flags
vars == <<s, flags>>
Init == s = "script" /\ flags = 0
Transcribe == s = "script" /\ s' = "transcribed" /\ UNCHANGED flags
Proofread == s = "transcribed" /\ s' = "proofread" /\ UNCHANGED flags
Plan == s = "proofread" /\ s' = "planned" /\ UNCHANGED flags
Build == s = "planned" /\ s' = "built" /\ UNCHANGED flags
RenderClean == s = "built" /\ s' = "rendered" /\ flags' = 0
RenderFlagged == s = "built" /\ s' = "rendered" /\ flags' = 1
Fix == s = "rendered" /\ flags = 1 /\ s' = "built" /\ flags' = 0
Deliver == s = "rendered" /\ flags = 0 /\ s' = "delivered" /\ UNCHANGED flags
Next == Transcribe \/ Proofread \/ Plan \/ Build \/ RenderClean \/ RenderFlagged \/ Fix \/ Deliver
Spec == Init /\ [][Next]_vars
DeliveredIsClean == s = "delivered" => flags = 0
NoBuildBeforeProofread == s \in {"built","rendered","delivered"} => TRUE
====
