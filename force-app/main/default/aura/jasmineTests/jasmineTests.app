<aura:application >

    <c:lts_jasmineRunner testFiles="{!join(',', 
    	$Resource.stratcraftTests,
       
		$Resource.jasmineExampleTests
		
    )}" />

</aura:application>