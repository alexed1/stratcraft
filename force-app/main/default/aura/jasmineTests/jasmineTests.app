<aura:application >
    <c:lts_jasmineRunner testFiles="{!join(',', 
    	$Resource.jasmineEndToEndTests
    )}" />  
</aura:application>