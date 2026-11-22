import json
import os
from typing import List, Dict, Any, Tuple
import networkx as nx

class InteractionGraphEngine:
    def __init__(self, data_path: str = None):
        if not data_path:
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            data_path = os.path.join(base_dir, "data", "sample_interactions.json")
        
        self.data_path = data_path
        self.interactions_db: List[Dict[str, Any]] = []
        self.load_data()

    def load_data(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, "r", encoding="utf-8") as f:
                self.interactions_db = json.load(f)
        else:
            self.interactions_db = []

    def _normalize_name(self, name: str) -> str:
        if not name:
            return ""
        # Remove common salt suffixes or formulations for matching
        cleaned = name.lower().strip()
        tokens = cleaned.split()
        if tokens:
            return tokens[0] # Primary drug stem
        return cleaned

    def detect_interactions(self, medications: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Takes a list of patient medications and matches all pairs against the reference interaction database.
        Constructs a NetworkX interaction graph and computes graph metrics.
        """
        detected: List[Dict[str, Any]] = []
        seen_pairs = set()

        # Build pair combinations
        num_meds = len(medications)
        for i in range(num_meds):
            for j in range(i + 1, num_meds):
                med1 = medications[i]
                med2 = medications[j]

                name1_gen = (med1.get("generic_name") or med1.get("name") or "").strip()
                name1_brand = (med1.get("brand_name") or "").strip()
                name1_act = (med1.get("active_ingredient") or "").strip()

                name2_gen = (med2.get("generic_name") or med2.get("name") or "").strip()
                name2_brand = (med2.get("brand_name") or "").strip()
                name2_act = (med2.get("active_ingredient") or "").strip()

                # Gather all search tokens for both medications
                tokens1 = {name1_gen.lower(), name1_brand.lower(), name1_act.lower(), self._normalize_name(name1_gen)} - {""}
                tokens2 = {name2_gen.lower(), name2_brand.lower(), name2_act.lower(), self._normalize_name(name2_gen)} - {""}

                # Search in interactions DB
                for rule in self.interactions_db:
                    rule_a = rule["medication_a"].lower()
                    rule_b = rule["medication_b"].lower()

                    match_forward = (
                        any(t in rule_a or rule_a in t for t in tokens1) and
                        any(t in rule_b or rule_b in t for t in tokens2)
                    )
                    match_reverse = (
                        any(t in rule_a or rule_a in t for t in tokens2) and
                        any(t in rule_b or rule_b in t for t in tokens1)
                    )

                    if match_forward or match_reverse:
                        pair_key = tuple(sorted([name1_gen or name1_brand, name2_gen or name2_brand]))
                        if pair_key not in seen_pairs:
                            seen_pairs.add(pair_key)
                            detected.append({
                                "id": f"DDI-{len(detected) + 1}",
                                "medication_a": name1_gen or name1_brand,
                                "medication_b": name2_gen or name2_brand,
                                "severity": rule.get("severity", "Moderate"),
                                "mechanism": rule.get("mechanism", ""),
                                "clinical_effect": rule.get("clinical_effect", ""),
                                "recommendation": rule.get("recommendation", ""),
                                "source": rule.get("source", "PharmaFog Clinical Reference"),
                                "reference_status": rule.get("reference_status", "Verified Clinical Reference"),
                                "category": rule.get("category", "Pharmacological Interaction"),
                                "is_verified": rule.get("reference_status", "") == "Verified Clinical Reference"
                            })

        # Build NetworkX graph
        G = nx.Graph()
        for med in medications:
            m_name = (med.get("generic_name") or med.get("name") or "Unknown").strip()
            G.add_node(m_name, drug_class=med.get("drug_class", "General"))

        for item in detected:
            G.add_edge(item["medication_a"], item["medication_b"], severity=item["severity"])

        # Graph network metrics
        graph_stats = {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "density": round(nx.density(G), 3) if G.number_of_nodes() > 1 else 0.0,
            "connected_components": nx.number_connected_components(G),
            "centrality": {}
        }
        
        if G.number_of_nodes() > 0:
            degree_cent = nx.degree_centrality(G)
            graph_stats["centrality"] = {node: round(score, 3) for node, score in degree_cent.items()}

        return detected, graph_stats
