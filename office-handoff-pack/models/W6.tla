---- MODULE W6 ----
EXTENDS Naturals
VARIABLES s, approved, posted
vars == <<s, approved, posted>>
Init == s = "idle" /\ approved = FALSE /\ posted = 0
Trend == s = "idle" /\ s' = "trend" /\ UNCHANGED <<approved, posted>>
Idea == s = "trend" /\ s' = "idea" /\ UNCHANGED <<approved, posted>>
Script == s = "idea" /\ s' = "script" /\ UNCHANGED <<approved, posted>>
Submit == s = "script" /\ s' = "waiting" /\ UNCHANGED <<approved, posted>>
Approve == s = "waiting" /\ s' = "approved" /\ approved' = TRUE /\ UNCHANGED posted
Video == s = "approved" /\ s' = "video" /\ UNCHANGED <<approved, posted>>
Edit == s = "video" /\ s' = "edit" /\ UNCHANGED <<approved, posted>>
Post == s = "edit" /\ posted < 2 /\ s' = "idle" /\ approved' = FALSE /\ posted' = posted + 1
Next == Trend \/ Idea \/ Script \/ Submit \/ Approve \/ Video \/ Edit \/ Post
Spec == Init /\ [][Next]_vars
NoVideoBeforeApproval == s \in {"video","edit"} => approved
PostedNeedsEdit == posted <= 2
====
