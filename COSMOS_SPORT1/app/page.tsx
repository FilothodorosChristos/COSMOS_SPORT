"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertTriangle,
  BadgeCheck,
  BarChart3,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock,
  LineChart,
  Mail,
  Megaphone,
  MessageCircle,
  Palette,
  PenTool,
  Phone,
  Sparkles,
  Store,
  Trophy,
  User,
  Users,
  Warehouse,
} from "lucide-react";

type Stage = "profile" | "assessment" | "results";

type TrackId =
  | "sales"
  | "leadership"
  | "stockroom"
  | "visual"
  | "commercial"
  | "creative"
  | "hr"
  | "executive";

type Dimension =
  | "customer"
  | "judgment"
  | "teamwork"
  | "ownership"
  | "compliance"
  | "pace"
  | "roleSkill";

type ScoreVector = Record<Dimension, number>;

type Position = {
  id: string;
  title: string;
  track: TrackId;
  traits: string[];
  icon: React.ElementType;
};

type Candidate = {
  fullName: string;
  email: string;
  phone: string;
};

type AnswerOption = {
  label: "A" | "B" | "C" | "D";
  text: string;
  scores: ScoreVector;
  risk: boolean;
};

type Challenge = {
  id: number;
  title: string;
  competency: string;
  sourceLogic: string;
  options: AnswerOption[];
};

const dimensions: Dimension[] = [
  "customer",
  "judgment",
  "teamwork",
  "ownership",
  "compliance",
  "pace",
  "roleSkill",
];

const dimensionLabels: Record<Dimension, string> = {
  customer: "Customer / Candidate Experience",
  judgment: "Κρίση & Απόφαση",
  teamwork: "Ομαδικότητα",
  ownership: "Ownership",
  compliance: "Policy / Ethics",
  pace: "Ταχύτητα",
  roleSkill: "Role Skill",
};

function s(
  customer: number,
  judgment: number,
  teamwork: number,
  ownership: number,
  compliance: number,
  pace: number,
  roleSkill: number
): ScoreVector {
  return {
    customer,
    judgment,
    teamwork,
    ownership,
    compliance,
    pace,
    roleSkill,
  };
}

const positions: Position[] = [
  {
    id: "salesperson",
    title: "Salesperson / Πωλητής-τρια Καταστήματος",
    track: "sales",
    traits: ["customer care", "στόχοι", "επικοινωνία"],
    icon: Store,
  },
  {
    id: "supervisor",
    title: "Supervisor Καταστήματος",
    track: "leadership",
    traits: ["βάρδιες", "KPIs", "coaching"],
    icon: Trophy,
  },
  {
    id: "assistant-store-manager",
    title: "Assistant Store Manager",
    track: "leadership",
    traits: ["team leadership", "floor management", "sales"],
    icon: Users,
  },
  {
    id: "store-manager",
    title: "Store Manager",
    track: "leadership",
    traits: ["P&L", "people management", "strategy"],
    icon: Briefcase,
  },
  {
    id: "stockroom-supervisor",
    title: "Stockroom Supervisor",
    track: "stockroom",
    traits: ["stock accuracy", "process", "speed"],
    icon: Warehouse,
  },
  {
    id: "visual-merchandiser",
    title: "Visual Merchandiser",
    track: "visual",
    traits: ["layout", "brand standards", "commercial eye"],
    icon: Palette,
  },
  {
    id: "go-to-market",
    title: "Go to Market Associate",
    track: "commercial",
    traits: ["launches", "coordination", "deadlines"],
    icon: Megaphone,
  },
  {
    id: "commercial-allocator",
    title: "Junior Commercial Allocator",
    track: "commercial",
    traits: ["data", "stock allocation", "forecasting"],
    icon: LineChart,
  },
  {
    id: "junior-graphic-designer",
    title: "Junior Graphic Designer",
    track: "creative",
    traits: ["brand", "design", "deadlines"],
    icon: PenTool,
  },
  {
    id: "talent-hr",
    title: "Talent Acquisition / HR",
    track: "hr",
    traits: ["fairness", "candidate experience", "bias control"],
    icon: Users,
  },
  {
    id: "executive-assistant",
    title: "Executive Assistant",
    track: "executive",
    traits: ["confidentiality", "priorities", "precision"],
    icon: Calendar,
  },
];

const sourceLogic = {
  sales:
    "Βασισμένο σε O*NET retail sales tasks: customer needs, product advice, payments, returns, complaints, store security.",
  leadership:
    "Βασισμένο σε O*NET first-line retail supervisor tasks: staff supervision, complaints, inventory, performance, scheduling.",
  stockroom:
    "Βασισμένο σε O*NET stockers/order fillers tasks: receiving, storing, inventory accuracy, shelves, orders, safety.",
  visual:
    "Βασισμένο σε O*NET merchandise displayers tasks: displays, signage, visual standards, promotions, layout.",
  commercial:
    "Βασισμένο σε commercial planning/allocation logic: demand, stock allocation, forecast, launches, margin.",
  creative:
    "Βασισμένο σε design workflow logic: brand consistency, assets, deadlines, rights, accessibility.",
  hr:
    "Βασισμένο σε OPM/Google re:Work structured interviews: fairness, structured criteria, candidate experience, bias control.",
  executive:
    "Βασισμένο σε executive support competencies: confidentiality, prioritisation, stakeholder management, accuracy.",
};

const scenarioBank: Record<TrackId, string[]> = {
  sales: [
    "Πελάτης απαιτεί refund για premium sneaker που έχει φορεθεί σε αγώνα, ενώ το policy δεν το καλύπτει και η ουρά μεγαλώνει.",
    "Δύο πελάτες διεκδικούν το τελευταίο limited προϊόν και ο ένας αρχίζει να σε βιντεοσκοπεί.",
    "Το POS πέφτει σε peak hour και πελάτης με click & collect απειλεί με αρνητικό review.",
    "Συνάδελφος υπόσχεται λάθος διαθεσιμότητα και ο πελάτης επιστρέφει θυμωμένος ζητώντας εσένα.",
    "Πελάτης με μικρό budget πιέζεται από φίλους του να πάρει ακριβότερο προϊόν που δεν του ταιριάζει.",
    "Βλέπεις πιθανή κλοπή ενώ ήδη εξυπηρετείς οικογένεια που χρειάζεται βοήθεια.",
    "Πελάτης ζητά τεχνική συμβουλή για running shoe και εσύ δεν είσαι σίγουρος για το μοντέλο.",
    "Influencer ζητά ειδική μεταχείριση μπροστά σε άλλους πελάτες για να ανεβάσει θετικό story.",
    "Πελάτης με αναπηρία δυσκολεύεται να δοκιμάσει παπούτσια σε ώρα με χαμηλό προσωπικό.",
    "Το online δείχνει διαθέσιμο προϊόν, αλλά στο ράφι δεν υπάρχει και ο πελάτης ταξίδεψε από άλλη περιοχή.",
    "Πελάτης ζητά να παρακάμψει σειρά επειδή βιάζεται για πτήση και οι υπόλοιποι αντιδρούν.",
    "Νέος συνάδελφος δέχεται επιθετική συμπεριφορά από πελάτη και παγώνει.",
    "Πελάτης δεν μιλά καλά ελληνικά/αγγλικά και δημιουργείται παρεξήγηση για αλλαγή μεγέθους.",
    "Ο manager πιέζει για upsell, αλλά βλέπεις ότι ο πελάτης χρειάζεται πιο οικονομική και ασφαλή επιλογή.",
    "Πελάτης κατηγορεί δημόσια το κατάστημα ότι κρύβει προσφορές.",
    "Λίγο πριν το κλείσιμο μπαίνει ομάδα πελατών που ζητά πλήρη εξυπηρέτηση.",
    "Έφηβοι προκαλούν φθορά σε display ενώ ένας γονέας ζητά άμεση εξυπηρέτηση.",
    "Πελάτης ζητά αλλαγή χωρίς απόδειξη και λέει ότι είναι χρόνια πελάτης.",
    "Παρατηρείς συνάδελφο να κάνει ειρωνικό σχόλιο για πελάτη στα δοκιμαστήρια.",
    "Έρχεται mystery shopper ενώ το floor έχει ελλείψεις και η ομάδα είναι πιεσμένη.",
  ],

  leadership: [
    "Δύο top performers συγκρούονται μπροστά στην ομάδα μία ώρα πριν από μεγάλο product launch.",
    "Η ομάδα πέτυχε πωλήσεις, αλλά πήρε κακό feedback επειδή πίεζε υπερβολικά πελάτες.",
    "Έμπειρος εργαζόμενος έχει υψηλές πωλήσεις αλλά αγνοεί συστηματικά διαδικασίες.",
    "Έχεις τρεις απουσίες την ημέρα με τη μεγαλύτερη κίνηση του μήνα.",
    "Νέος εργαζόμενος κάνει σοβαρό λάθος στο ταμείο και φοβάται ότι θα απολυθεί.",
    "Η ομάδα αντιστέκεται σε νέο KPI dashboard γιατί το θεωρεί εργαλείο ελέγχου.",
    "Πελάτης ζητά manager και απειλεί με δημόσια καταγγελία σε social media.",
    "Supervisor αλλάζει βάρδιες υπέρ φίλων του και η ομάδα το έχει αντιληφθεί.",
    "Το κατάστημα έχει άριστη εικόνα, αλλά οι πωλήσεις είναι κάτω από στόχο.",
    "Regional manager έρχεται απροειδοποίητα και υπάρχουν operational gaps.",
    "Πρέπει να δώσεις δύσκολο feedback σε εργαζόμενο που είναι αγαπητός στην ομάδα.",
    "Ένας εργαζόμενος αναφέρει ανάρμοστη συμπεριφορά συναδέλφου σε πελάτη.",
    "Υπάρχει ένταση μεταξύ full-time και part-time εργαζομένων για βάρδιες.",
    "Το team bonus χάθηκε για μικρή απόκλιση και η ομάδα είναι απογοητευμένη.",
    "Assistant manager διαφωνεί δημόσια με οδηγία σου μπροστά στην ομάδα.",
    "Υπάλληλος ζητά εξαίρεση από διαδικασία για προσωπικό λόγο.",
    "Έχεις στοιχεία για λάθος refunds αλλά όχι πλήρη απόδειξη.",
    "Η ομάδα κάνει overpromising σε πελάτες για να κλείσει πωλήσεις.",
    "Εργαζόμενος αποδίδει άριστα αλλά δημιουργεί τοξικό κλίμα.",
    "Ο πελάτης έχει δίκιο, αλλά η επίλυση θα χαλάσει το ημερήσιο KPI.",
  ],

  stockroom: [
    "Στην απογραφή λείπουν premium sneakers και το κατάστημα ανοίγει σε 30 λεπτά.",
    "Νέο drop έρχεται χωρίς σωστή σήμανση και το launch είναι την ίδια μέρα.",
    "Το σύστημα δείχνει stock που δεν υπάρχει φυσικά στο stockroom.",
    "Sales team πιέζει για άμεση τροφοδοσία, αλλά δεν έχει γίνει quality check.",
    "Βρίσκεις κατεστραμμένα προϊόντα που φαίνονται να έχουν μετακινηθεί πρόχειρα.",
    "Courier αφήνει παλέτες σε σημείο που μπλοκάρει διάδρομο ασφαλείας.",
    "Πρέπει να κάνεις transfer ενώ τρέχουν ταυτόχρονα online orders.",
    "Νέος εργαζόμενος βάζει λάθος κωδικούς σε ακριβά προϊόντα.",
    "Το stockroom είναι γεμάτο και εμποδίζει emergency exit.",
    "Υπάρχει μεγάλη διαφορά μεταξύ ERP και φυσικού αποθέματος σε best sellers.",
    "Το sales floor ζητά προϊόν που έχει δεσμευτεί για click & collect.",
    "Μέλος της ομάδας παρακάμπτει FIFO για να γλιτώσει χρόνο.",
    "Έρχεται audit και υπάρχουν ατακτοποίητες επιστροφές τριών ημερών.",
    "Barcode scanner χαλάει σε peak παραλαβή.",
    "Προϊόν υψηλής αξίας βρίσκεται χωρίς αντικλεπτικό tag.",
    "Πρέπει να εκπαιδεύσεις νέο μέλος ενώ τρέχει απογραφή.",
    "Λάθος μέγεθος στάλθηκε σε online πελάτη και η ομάδα κατηγορεί το stockroom.",
    "Υπάρχει υποψία εσωτερικής απώλειας αλλά όχι απόδειξη.",
    "Έχεις conflicting οδηγίες από Store Manager και Operations.",
    "Στο τέλος ημέρας υπάρχουν ανοιχτές διαφορές που κανείς δεν έχει καταγράψει.",
  ],

  visual: [
    "Το global brand guideline συγκρούεται με τη χωρητικότητα του τοπικού καταστήματος.",
    "Νέο launch πρέπει να στηθεί σε δύο ώρες, αλλά λείπουν βασικά props.",
    "Commercial team ζητά προβολή προϊόντος που χαλάει το hero wall.",
    "Store Manager θέλει αλλαγή layout που αυξάνει πωλήσεις αλλά παραβιάζει brand standards.",
    "Υπάρχει πτώση conversion σε area που είναι οπτικά εντυπωσιακή.",
    "Signage προσφοράς μπερδεύει πελάτες και δημιουργεί παράπονα.",
    "Visual setup φαίνεται premium αλλά δυσκολεύει accessibility.",
    "Έρχεται φωτογράφιση social media και υπάρχουν stock gaps.",
    "Best seller είναι χαμηλά στο display λόγω αισθητικής επιλογής.",
    "Πρέπει να αλλάξεις βιτρίνα ενώ το κατάστημα είναι γεμάτο.",
    "Η ομάδα μετακινεί προϊόντα κάθε βράδυ χωρίς ενημέρωση.",
    "Marketing, buying και store manager δίνουν αντικρουόμενες οδηγίες.",
    "Display με premium sneakers αυξάνει risk κλοπής.",
    "Campaign αργεί και πρέπει να κάνεις προσωρινό visual concept.",
    "Ο φωτισμός αναδεικνύει λάθος προϊόντα.",
    "Παιδικό section είναι εμπορικά δυνατό αλλά οπτικά υποβαθμισμένο.",
    "Προωθούμενο προϊόν έχει πολύ μικρή διαθεσιμότητα.",
    "Window display είναι εντυπωσιακό αλλά δεν αντικατοπτρίζει διαθέσιμο stock.",
    "Visual αλλαγή αυξάνει dwell time αλλά μειώνει ταμειακή ροή.",
    "Προωθητικό υλικό έχει λάθος τιμές.",
  ],

  commercial: [
    "Launch προϊόντος έχει καθυστέρηση stock, αλλά η καμπάνια έχει ήδη προγραμματιστεί.",
    "Τα δεδομένα πωλήσεων δείχνουν ζήτηση σε άλλη πόλη από αυτή που έγινε allocation.",
    "Marketing θέλει δυνατό push, αλλά το απόθεμα δεν επαρκεί.",
    "Best seller εξαντλείται ενώ slow movers πιάνουν χώρο.",
    "Πρέπει να αποφασίσεις allocation χωρίς πλήρη historical data.",
    "Store Manager ζητά stock λόγω local event, αλλά άλλα stores έχουν μεγαλύτερο conversion.",
    "Το e-shop πουλά πιο γρήγορα από retail και δημιουργείται σύγκρουση καναλιών.",
    "Προμηθευτής αλλάζει delivery date τελευταία στιγμή.",
    "Campaign έχει λάθος forecast και πρέπει να κάνεις damage control.",
    "Νέο trend εμφανίζεται στα social και δεν υπάρχει έτοιμο πλάνο.",
    "Πρέπει να εξηγήσεις σε stores γιατί δεν παίρνουν ίσο stock.",
    "Commercial team θέλει discount, αλλά το brand ζητά premium positioning.",
    "Λάθος τιμολόγηση εμφανίζεται πριν από nationwide launch.",
    "Προϊόν έχει υψηλό traffic αλλά χαμηλό conversion.",
    "Πρέπει να αποφασίσεις markdown strategy με μικρό margin.",
    "Τα δεδομένα δύο συστημάτων διαφωνούν μεταξύ τους.",
    "Έρχεται competitor campaign και πρέπει να αντιδράσεις γρήγορα.",
    "Προϊόν που προωθείται έχει αυξημένες επιστροφές.",
    "Πωλήσεις ανεβαίνουν αλλά margin πέφτει επικίνδυνα.",
    "Launch πέτυχε σε awareness αλλά απέτυχε σε conversion.",
  ],

  creative: [
    "Creative brief αλλάζει τρεις ώρες πριν το deadline για paid campaign.",
    "Design εγκρίθηκε από marketing αλλά απορρίπτεται από brand τελευταία στιγμή.",
    "Πρέπει να δημιουργήσεις assets για πολλά formats με ελλιπές υλικό.",
    "Manager ζητά trend-based design που δεν ταιριάζει στο brand.",
    "Έχεις deadline σήμερα αλλά το copy αλλάζει συνεχώς.",
    "Campaign χρειάζεται premium look με πολύ περιορισμένο χρόνο.",
    "Παρατηρείς ότι χρησιμοποιήθηκε εικόνα χωρίς ξεκάθαρα δικαιώματα.",
    "Performance team ζητά πιο aggressive visuals από όσα επιτρέπει το brand.",
    "Design παίρνει αρνητικό feedback χωρίς συγκεκριμένη αιτιολόγηση.",
    "Πρέπει να φτιάξεις social assets ενώ λείπουν product shots.",
    "Δύο stakeholders δίνουν αντικρουόμενες οδηγίες.",
    "Final αρχείο έχει λάθος διαστάσεις μετά από αλλαγή καναλιού.",
    "Πρέπει να κάνεις localization χωρίς να χαθεί το μήνυμα.",
    "Design είναι όμορφο αλλά δυσανάγνωστο στο mobile.",
    "Brand ζητά minimal ύφος, campaign ζητά έντονο call-to-action.",
    "Παλιό template έχει λάθος logo usage.",
    "Creative concept μοιάζει υπερβολικά με ανταγωνιστή.",
    "Τα analytics δείχνουν ότι το λιγότερο όμορφο creative αποδίδει καλύτερα.",
    "Copy έχει πιθανό cultural sensitivity issue.",
    "Τελικός reviewer ζητά αλλαγές που χαλούν accessibility.",
  ],

  hr: [
    "Υποψήφιος κάνει viral post για κακή εμπειρία συνέντευξης πριν προλάβεις να απαντήσεις.",
    "Hiring manager θέλει απόρριψη υποψηφίου με βάση ένστικτο χωρίς στοιχεία.",
    "Δύο εξαιρετικοί υποψήφιοι έχουν διαφορετικά δυνατά σημεία και υπάρχει μία θέση.",
    "Υποψήφιος ζητά feedback μετά από απόρριψη και είναι εμφανώς απογοητευμένος.",
    "Πρέπει να κλείσεις θέση γρήγορα, αλλά το candidate pool δεν είναι αρκετά ποιοτικό.",
    "Συνεντευκτής κάνει ακατάλληλη ερώτηση σε υποψήφιο.",
    "Υποψήφιος με άριστο CV δείχνει χαμηλό culture fit.",
    "Hiring manager αλλάζει requirements μετά από 20 interviews.",
    "Πρέπει να μειώσεις time-to-hire χωρίς να πέσει η ποιότητα αξιολόγησης.",
    "Υποψήφιος ζητά μισθό πάνω από budget αλλά είναι εξαιρετικός.",
    "Λαμβάνεις καταγγελία ότι interview panel είχε προκατάληψη.",
    "Referral candidate πιέζεται να προχωρήσει χωρίς ίση αξιολόγηση.",
    "Υποψήφιος ακυρώνει δεύτερη φορά τελευταία στιγμή.",
    "Hiring manager ζητά πρόσληψη χωρίς process check.",
    "Πρέπει να δώσεις αρνητικό feedback σε εσωτερικό υποψήφιο.",
    "Έχεις υψηλό offer decline rate και δεν ξέρεις γιατί.",
    "Candidate journey έχει πολλά βήματα και οι υποψήφιοι εγκαταλείπουν.",
    "Υποψήφιος ζητά accessibility προσαρμογή.",
    "Συνέντευξη καθυστερεί 40 λεπτά και ο υποψήφιος δυσανασχετεί.",
    "Πίεση να προτιμηθεί υποψήφιος επειδή γνωρίζει senior στέλεχος.",
  ],

  executive: [
    "CEO έχει τρία overlapping meetings και όλα χαρακτηρίζονται κρίσιμα.",
    "Λαμβάνεις εμπιστευτικό email που στάλθηκε κατά λάθος σε λάθος παραλήπτη.",
    "Πρέπει να αλλάξεις ταξιδιωτικό πλάνο senior στελέχους λόγω έκτακτης κρίσης.",
    "Δύο directors ζητούν πρόσβαση στο ίδιο confidential document.",
    "Meeting με εξωτερικό συνεργάτη καθυστερεί και επηρεάζει όλο το πρόγραμμα.",
    "Πρέπει να προτεραιοποιήσεις αιτήματα χωρίς να εκθέσεις stakeholders.",
    "Στέλεχος ζητά να μεταφέρεις ευαίσθητο μήνυμα σε ομάδα.",
    "Παρατηρείς λάθος σε παρουσίαση πριν σταλεί στο board.",
    "Υπάρχει σύγκρουση μεταξύ εμπιστευτικότητας και γρήγορης ενημέρωσης.",
    "CEO ζητά last-minute briefing με ελλιπή στοιχεία.",
    "Πρέπει να οργανώσεις επίσκεψη σημαντικού partner με πολλές αλλαγές.",
    "Δημοσιογράφος ζητά επιβεβαίωση ευαίσθητης πληροφορίας.",
    "Σημαντικό αρχείο χάθηκε λίγο πριν από meeting.",
    "Πρέπει να αρνηθείς ευγενικά αίτημα που δεν χωρά στο πρόγραμμα.",
    "Stakeholder παρακάμπτει διαδικασία και πιέζει άμεσα.",
    "Πρέπει να κρατήσεις πρακτικά σε meeting με ευαίσθητα θέματα.",
    "Ημερολόγιο γεμίζει με low-value meetings.",
    "Senior επισκέπτης φτάνει νωρίτερα και η ομάδα δεν είναι έτοιμη.",
    "Σου ζητούν πληροφορία που δεν ξέρεις αν επιτρέπεται να μοιραστείς.",
    "Λάθος ημερομηνία σε πρόσκληση έχει ήδη σταλεί σε πολλούς.",
  ],
};
const competencies = [
  "Conflict under pressure",
  "Customer / stakeholder judgment",
  "Ethics & policy",
  "Prioritisation",
  "Ownership & communication",
];

function optionSet(track: TrackId, index: number): AnswerOption[] {
  const variants = [
    [
      "Ζητάω χρόνο, ακούω χωρίς άμυνα, ελέγχω policy/δεδομένα, προτείνω καθαρό επόμενο βήμα και κάνω follow-up.",
      "Δίνω γρήγορη εξαίρεση για να πέσει η ένταση, χωρίς να καταγράψω το περιστατικό.",
      "Κλιμακώνω αμέσως χωρίς να κάνω καμία αρχική αξιολόγηση.",
      "Αντιδρώ αυστηρά, κλείνω το θέμα γρήγορα και δίνω προτεραιότητα στο KPI.",
    ],
    [
      "Διαχωρίζω επείγον από σημαντικό, εξηγώ trade-off, προστατεύω εμπειρία και διαδικασία, και ενημερώνω τους σωστούς ανθρώπους.",
      "Επιλέγω τη λύση που φαίνεται πιο γρήγορη, ακόμα κι αν αφήνει ανοιχτά ρίσκα.",
      "Αφήνω το θέμα στον πιο έμπειρο συνάδελφο χωρίς ownership.",
      "Κάνω ό,τι ζητά ο πιο πιεστικός stakeholder για να αποφύγω σύγκρουση.",
    ],
    [
      "Σταματάω την κλιμάκωση, κρατάω ουδέτερη στάση, συλλέγω στοιχεία και αποφασίζω με βάση αξίες/κανόνες.",
      "Υποστηρίζω δημόσια την πλευρά που έχει καλύτερα αποτελέσματα μέχρι σήμερα.",
      "Περιμένω να ηρεμήσει μόνο του, γιατί η παρέμβαση μπορεί να το χειροτερέψει.",
      "Παρακάμπτω τον κανόνα επειδή η κατάσταση είναι αμήχανη.",
    ],
    [
      "Εξηγώ με διαφάνεια τι μπορεί και τι δεν μπορεί να γίνει, προσφέρω εναλλακτική και κρατάω αξιοπρεπή εμπειρία.",
      "Υπόσχομαι κάτι που μάλλον γίνεται, ώστε να κερδίσω χρόνο.",
      "Λέω ότι δεν είναι δική μου ευθύνη και συνεχίζω το αρχικό task.",
      "Ακυρώνω τη διαδικασία για να αποφύγω αρνητική αξιολόγηση.",
    ],
    [
      "Χρησιμοποιώ δεδομένα και ανθρώπινη κρίση μαζί, τεκμηριώνω απόφαση και δημιουργώ learning για την ομάδα.",
      "Ακολουθώ μόνο το ένστικτο γιατί η εμπειρία μου συνήθως αρκεί.",
      "Ακολουθώ τυφλά το σύστημα ακόμα κι αν βλέπω σοβαρό context.",
      "Κρύβω το πρόβλημα μέχρι να έχω χρόνο να το λύσω μόνος/η.",
    ],
  ];

  const selected = variants[index % variants.length];

  const roleBoost =
    track === "commercial"
      ? s(3, 5, 3, 4, 4, 4, 5)
      : track === "creative"
      ? s(3, 4, 4, 4, 5, 3, 5)
      : track === "stockroom"
      ? s(3, 4, 4, 4, 5, 5, 5)
      : track === "visual"
      ? s(4, 4, 4, 4, 4, 3, 5)
      : track === "hr"
      ? s(4, 5, 5, 5, 5, 3, 5)
      : track === "executive"
      ? s(3, 5, 4, 5, 5, 4, 5)
      : track === "leadership"
      ? s(4, 5, 5, 5, 4, 4, 5)
      : s(5, 4, 4, 4, 4, 5, 4);

  return [
    {
      label: "A",
      text: selected[0],
      scores: roleBoost,
      risk: false,
    },
    {
      label: "B",
      text: selected[1],
      scores: s(3, 3, 2, 2, 1, 5, 3),
      risk: index % 3 === 0,
    },
    {
      label: "C",
      text: selected[2],
      scores: s(2, 2, 3, 1, 3, 2, 2),
      risk: true,
    },
    {
      label: "D",
      text: selected[3],
      scores: s(1, 1, 1, 1, 0, 4, 1),
      risk: true,
    },
  ];
}

function buildChallenges(track: TrackId): Challenge[] {
  return scenarioBank[track].map((title, index) => ({
    id: index + 1,
    title,
    competency: competencies[index % competencies.length],
    sourceLogic: sourceLogic[track],
    options: optionSet(track, index),
  }));
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-3 w-full rounded-full bg-slate-100">
      <div
        className="h-3 rounded-full bg-black transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function optionTotal(option: AnswerOption) {
  return dimensions.reduce((sum, key) => sum + option.scores[key], 0);
}

export default function CosmosTalentSprint() {
  const [stage, setStage] = useState<Stage>("profile");

  const [candidate, setCandidate] = useState<Candidate>({
    fullName: "",
    email: "",
    phone: "",
  });

  const [position, setPosition] = useState<Position>(positions[0]);

  const [answers, setAnswers] = useState<Record<number, AnswerOption>>({});

  const [step, setStep] = useState(0);

  const [timerStarted, setTimerStarted] = useState(false);

  const [timeLeft, setTimeLeft] = useState(8 * 60);

  const challenges = useMemo(
    () => buildChallenges(position.track),
    [position]
  );

  const current = challenges[step];

  const profileValid =
    candidate.fullName.trim().length >= 4 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(candidate.email) &&
    candidate.phone.trim().length >= 8;

  useEffect(() => {
    if (!timerStarted || stage !== "assessment") return;

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setStage("results");
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerStarted, stage]);

  function startAssessment() {
    if (!profileValid) return;

    setStage("assessment");
    setAnswers({});
    setStep(0);
    setTimerStarted(false);
    setTimeLeft(8 * 60);
  }

  function choosePosition(nextPosition: Position) {
    setPosition(nextPosition);
    setAnswers({});
    setStep(0);
    setTimerStarted(false);
    setTimeLeft(8 * 60);
  }

  function answerQuestion(option: AnswerOption) {
    if (!timerStarted) {
      setTimerStarted(true);
    }

    setAnswers((prev) => ({
      ...prev,
      [current.id]: option,
    }));
  }

  const result = useMemo(() => {
    const answered = Object.values(answers);

    const rawScore = answered.reduce(
      (sum, option) => sum + optionTotal(option),
      0
    );

    const maxPerQuestion = Math.max(
      ...current.options.map((option) => optionTotal(option))
    );

    const maxScore = challenges.length * maxPerQuestion;

    const overall = Math.round((rawScore / maxScore) * 100);

    const dimensionScores = dimensions.map((dimension) => {
      const earned = answered.reduce(
        (sum, option) => sum + option.scores[dimension],
        0
      );

      const max = challenges.length * 5;

      return {
        dimension,
        label: dimensionLabels[dimension],
        value: Math.round((earned / max) * 100),
      };
    });

    const riskAnswers = answered.filter((option) => option.risk).length;

    const completion = Math.round(
      (answered.length / challenges.length) * 100
    );

    const recommendation =
      completion < 100
        ? "Incomplete / Δεν ολοκληρώθηκε"
        : overall >= 85 && riskAnswers <= 2
        ? "Strong Hire / Fast Track"
        : overall >= 72 && riskAnswers <= 5
        ? "Hire / Προτείνεται structured interview"
        : overall >= 58
        ? "Maybe / Θέλει δεύτερη αξιολόγηση"
        : "No Hire για τώρα / Προτείνεται επαναξιολόγηση";

    const topDimensions = [...dimensionScores]
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);

    const weakDimensions = [...dimensionScores]
      .sort((a, b) => a.value - b.value)
      .slice(0, 2);

    return {
      rawScore,
      overall,
      completion,
      riskAnswers,
      recommendation,
      dimensionScores,
      topDimensions,
      weakDimensions,
    };
  }, [answers, challenges.length, current.options]);

 return (
  <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-zinc-100 p-6 text-slate-950">
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-black p-8 text-white shadow-xl"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
              <Sparkles size={16} />
              Cosmos Talent Sprint
            </div>

            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              AI Hiring Assessment για COSMOS SPORT
            </h1>

            <p className="mt-4 max-w-3xl text-slate-300">
              Structured role-based assessment με 20 evidence-based scenarios,
              scoring engine, risk analysis και recruiter dashboard.
            </p>
          </div>

          {stage === "results" && (
            <div className="rounded-2xl bg-white p-5 text-black shadow-lg">
              <div className="text-sm text-slate-500">Current Assessment</div>
              <div className="text-2xl font-black">{position.title}</div>
              <div className="mt-2 text-sm text-slate-500">
                20 Questions • 8 Minutes
              </div>
            </div>
)}
        </div>
      </motion.div>

      {stage === "profile" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-3xl shadow-sm lg:col-span-1">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-xl font-bold">1. Στοιχεία υποψηφίου</h2>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <User size={16} /> Ονοματεπώνυμο
                  </label>
                  <Input
                    placeholder="π.χ. Μαρία Παπαδοπούλου"
                    value={candidate.fullName}
                    onChange={(e) =>
                      setCandidate({ ...candidate, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Mail size={16} /> Email
                  </label>
                  <Input
                    placeholder="name@email.com"
                    value={candidate.email}
                    onChange={(e) =>
                      setCandidate({ ...candidate, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Phone size={16} /> Τηλέφωνο
                  </label>
                  <Input
                    placeholder="69xxxxxxxx"
                    value={candidate.phone}
                    onChange={(e) =>
                      setCandidate({ ...candidate, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                Ο timer 8 λεπτών ξεκινά μόλις απαντηθεί η πρώτη ερώτηση.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl shadow-sm lg:col-span-2">
            <CardContent className="space-y-5 p-6">
              <h2 className="text-xl font-bold">2. Επιλογή θέσης εργασίας</h2>

              <div className="grid gap-3 md:grid-cols-2">
                {positions.map((p) => {
                  const Icon = p.icon;
                  const active = position.id === p.id;

                  return (
                    <button
                      key={p.id}
                      onClick={() => choosePosition(p)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-black bg-black text-white"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} />
                        <span className="font-semibold">{p.title}</span>
                      </div>

                      <div
                        className={`mt-2 text-sm ${
                          active ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {p.traits.join(" • ")}
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button
                disabled={!profileValid}
                onClick={startAssessment}
                className="w-full rounded-2xl py-6 text-base"
              >
                Ξεκίνα assessment 20 ερωτήσεων
              </Button>

              {!profileValid && (
                <p className="text-sm text-slate-500">
                  Συμπλήρωσε σωστά ονοματεπώνυμο, email και τηλέφωνο για να
                  συνεχίσεις.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {stage === "assessment" && (
        <div className="mx-auto max-w-4xl">
          <Card className="rounded-3xl shadow-sm">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                <div>
                  <div className="text-sm font-semibold text-slate-500">
                    Ερώτηση {step + 1}/{challenges.length}
                  </div>
                  <h2 className="mt-1 text-2xl font-bold">{current.title}</h2>
                </div>

                <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold">
                  {current.competency}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                {current.sourceLogic}
              </div>

              <div className="grid gap-3">
                {current.options.map((option) => {
                  const active = answers[current.id]?.label === option.label;

                  return (
                    <button
                      key={option.label}
                      onClick={() => answerQuestion(option)}
                      className={`rounded-2xl border p-4 text-left transition hover:bg-slate-50 ${
                        active ? "border-black bg-slate-100" : "bg-white"
                      }`}
                    >
                      <div className="mb-2 font-black">{option.label}</div>
                      <div>{option.text}</div>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-between gap-3">
                <Button
                  variant="outline"
                  disabled={step === 0}
                  onClick={() => setStep(step - 1)}
                >
                  Προηγούμενη
                </Button>

                {step < challenges.length - 1 ? (
                  <Button
                    disabled={!answers[current.id]}
                    onClick={() => setStep(step + 1)}
                  >
                    Επόμενη
                  </Button>
                ) : (
                  <Button
                    disabled={!answers[current.id]}
                    onClick={() => setStage("results")}
                  >
                    Δες αποτελέσματα
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {stage === "results" && (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-3xl shadow-sm lg:col-span-2">
            <CardContent className="space-y-6 p-6">
              <div className="flex items-center gap-3">
                <BadgeCheck />
                <h2 className="text-2xl font-bold">Recruiter Dashboard</h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-3xl bg-black p-6 text-white">
                  <div className="text-sm text-slate-300">Overall Match</div>
                  <div className="text-5xl font-black">{result.overall}%</div>
                </div>

                <div className="rounded-3xl bg-slate-100 p-6">
                  <div className="text-sm text-slate-500">Completion</div>
                  <div className="text-5xl font-black">
                    {result.completion}%
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-100 p-6">
                  <div className="text-sm text-slate-500">Risk Answers</div>
                  <div className="text-5xl font-black">
                    {result.riskAnswers}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border p-5">
                <div className="mb-2 flex items-center gap-2 font-bold">
                  <CheckCircle2 /> Απόφαση συστήματος
                </div>
                <p className="text-slate-700">{result.recommendation}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold">
                  <BarChart3 /> Ανάλυση δεξιοτήτων
                </div>

                {result.dimensionScores.map((item) => (
                  <div key={item.dimension}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="font-semibold">{item.value}%</span>
                    </div>
                    <Progress value={item.value} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl bg-black text-white shadow-sm">
            <CardContent className="space-y-5 p-6">
              <MessageCircle />

              <h2 className="text-xl font-bold">AI-style σύνοψη</h2>

              <p className="text-slate-300">
                Ο/Η {candidate.fullName} αξιολογήθηκε για τη θέση{" "}
                {position.title}. Πρόταση:{" "}
                <span className="font-bold text-white">
                  {result.recommendation}
                </span>
                .
              </p>

              <div>
                <div className="mb-2 font-semibold">Δυνατά σημεία</div>
                <div className="space-y-2">
                  {result.topDimensions.map((item) => (
                    <div
                      key={item.dimension}
                      className="rounded-2xl bg-white/10 p-3"
                    >
                      {item.label}: {item.value}%
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2 font-semibold">
                  <AlertTriangle size={18} /> Θέλει έλεγχο
                </div>
                <div className="space-y-2">
                  {result.weakDimensions.map((item) => (
                    <div
                      key={item.dimension}
                      className="rounded-2xl bg-white/10 p-3"
                    >
                      {item.label}: {item.value}%
                    </div>
                  ))}
                </div>
              </div>

              <Button
                className="w-full bg-white text-black hover:bg-slate-200"
                onClick={() => {
                  setStage("profile");
                  setAnswers({});
                  setStep(0);
                  setTimerStarted(false);
                  setTimeLeft(8 * 60);
                }}
              >
                Νέος υποψήφιος
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  </div>
);
}