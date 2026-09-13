def filter_documents_for_role(documents, role):
    """Return only document records that grant the incoming role access."""
    return [
        document for document in documents
        if role in document.get("allowed_roles", [])
    ]
