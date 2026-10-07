"""Generate corpus_demo/manifest_fed_cdmx.json pointing to the .txt files we copied."""
import json
import hashlib
from pathlib import Path

orig = json.loads(Path("corpus_mx/manifest_fed_cdmx.json").read_text(encoding="utf-8"))
demo_corpus = Path("corpus_demo")

new_docs = []
for doc in orig["docs"]:
    txt = doc.get("text_path", "")
    if not txt:
        continue
    rel = txt.replace("corpus_mx/", "")          # e.g. "fed/CCF.txt"
    txt_dest = demo_corpus / rel
    if not txt_dest.exists():
        print("MISSING:", txt_dest)
        continue
    h = hashlib.sha256(txt_dest.read_bytes()).hexdigest()
    expected = doc["text_sha256"]
    if h != expected:
        print(f"HASH MISMATCH {doc['doc_id']}: {h} vs {expected}")
        continue
    new_doc = {
        "doc_id": doc["doc_id"],
        "title": doc["title"],
        "publisher": doc["publisher"],
        "jurisdiction": doc["jurisdiction"],
        "url": doc["url"],
        "retrieved_at": doc["retrieved_at"],
        "sha256": doc["text_sha256"],
        "file_path": "corpus_demo/" + rel,
        "text_path": "corpus_demo/" + rel,
        "text_sha256": doc["text_sha256"],
        "text_extractor": doc.get("text_extractor", ""),
        "file_in_repo": True,
    }
    if doc.get("last_reform"):
        new_doc["last_reform"] = doc["last_reform"]
    new_docs.append(new_doc)
    print("OK", doc["doc_id"], rel)

out = {"docs": new_docs}
Path("corpus_demo/manifest_fed_cdmx.json").write_text(
    json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8"
)
print(f"manifest written: {len(new_docs)} docs")
